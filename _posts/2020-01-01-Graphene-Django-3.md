---
layout: post
title:  "Django Graphene 튜토리얼 따라하기 3"
date:   2020-01-01 15:12:00 +0700
categories: [django, graphql, relay]
---

> GraphQL 서버로 들어온 요청을 resolve 하는 방식에 대하여 더 알아봅니다.

[Github 소스코드](https://github.com/leesungbin/graphene_tutorial) 





# 5. 단일 Object 얻기 (`Filtering`)

우선, 다음과 같이 코드를 수정해 봅니다.

```python
# ingredients/schema.py
# Query class 부분 변경

class Query(object):
  category = graphene.Field(CategoryType, id=graphene.Int(), name=graphene.String())
  all_categories = graphene.List(CategoryType)
  
  ingredient = graphene.Field(IngredientType, id=graphene.Int(), name=graphene.String())
  all_ingredients = graphene.List(IngredientType)
  
  def resolve_all_categories(self, info, **kwargs):
    return Category.objects.all()
  
  def resolve_all_ingredients(self, info, **kwargs):
    return Ingredient.objecgs.all()
  
  def resolve_category(self, info, **kwargs):
    id = kwargs.get('id')
    name = kwargs.get('name')
    
    if id is not None:
      return Category.objects.get(pk=id)
   	if name is not None:
      return Category.objects.get(name=name)
    return None
  
  def resolve_ingredient(self, info, **kwargs):
    id = kwargs.get('id')
    name = kwargs.get('name')
    
    if id is not None:
      return Ingredient.objects.get(pk=id)
    if name is not None:
      return Ingredient.objects.get(name=name)
		return None
```

* category, ingredient의 단일 object 형식을 graphene Field에서 사용할 수 있도록 하였고, 

* resolve_category, resolve_ingredient 함수는 단일 object 요청을 resolve 해 줍니다.

* 다음과 같은 Query를 날려봅시다.

  ```graphql
  query {
    category(id:1){
      id
      name
    }
    anotherCategory: category(name: "Dairy"){
    	name
      ingredients {
        id
        name
      }
    }
  }
  ```

  결과는 아래와 같게 됩니다.

  ```json
  {
    "data": {
      "category": {
        "id": "1",
        "name": "Dairy"
      },
      "anotherCategory": {
        "name": "Dairy",
        "ingredients": [
          {
            "id": "1",
            "name": "Eggs"
          },
          {
            "id": "2",
            "name": "Milk"
          }
        ]
      }
    }
  }
  ```

* **그러나 현재는 반복되는 코드가 많습니다. 이를 보완해봅시다.**



# 6. `RELAY` in Graphene

현재까지 진행한 `ingredient/schema.py` 파일을 보면, Graphene을 사용했을 때, 그냥 Django 모델 사용하는 것보다 좋은 점이 무엇인지 느끼기 어렵습니다. 이제부터는 `django-filter` 와 함께 Graphene을 더 잘 사용해보는 방법을 알아봅시다.



* 먼저 `django-filter` 를 설치합니다.

```bash
pip install django-filter
```



* 그 다음, graphene에 내장된 relay를 사용하여  `ingredient/schema.py` 파일을 수정해봅니다.

```python
# ingredients/schema.py

# import 부분이 변경됩니다.
from graphene import relay, ObjectType
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from ingredients.models import Category, Ingredient

# class 명이 변경됩니다.
class CategoryNode(DjangoObjectType):
  class Meta:
    model = Category
    filter_fields = ['name', 'ingredients']
    interfaces = (relay.Node, )
    
class IngredientNode(DjangoObjectType):
  class Meta:
    model = Ingredient
    # 아래와 같은 방식으로 좀 더 구체적인 필터링이 가능할 수 있습니다.
    filter_fileds = {
      'name': ['exact', 'icontains', 'istartswith'],
      'notes': ['exact', 'icontains'],
      'category': ['exact'],
      'category__name': ['exact'],
    }
    interfaces = (relay.Node, )
    
class Query(graphene.ObjectType):
  category = relay.Node.Field(CategoryNode)
  all_categories = DjangoFilerConnectionField(CategoryNode)
  
  ingredient = relay.Node.Field(IngredientNode)
  all_ingredients = DjangoFilterConnectionField(IngredientNode)
```

* Graphql playground에서 Docs를 확인해보면, 우리가 작성한 코드가 어떤식으로 적용될 수 있는지를 확인해볼 수 있습니다. 필터링 옵션을 직접 구현하지 않아도, 어떤 필터링을 사용할지만 알면 됩니다.

* 이제는 Relay의 형식을 따라서 접근해야합니다. 
  * Connection에는 edges 가 있고, 각 edge별로 node가 있습니다. 이 node 는 객체 1개입니다.
* 다음과 같은 query를 날려봅시다.

```graphql
query {
	allCategories {
		edges {
			node {
				id
				name
			}
		}
	}
}
```

* 다음과 같은 결과를 얻습니다.

```json
{
  "data": {
    "allCategories": {
      "edges": [
        {
          "node": {
            "id": "Q2F0ZWdvcnlOb2RlOjE=",
            "name": "Dairy"
          }
        },
        {
          "node": {
            "id": "Q2F0ZWdvcnlOb2RlOjI=",
            "name": "Meat"
          }
        }
      ]
    }
  }
}
```

* 위 결과에서 볼 수 있듯, 자동적으로 unique한 ID가 생겼습니다. 즉, ID가 0, 1, 2, .. 와 같은 형태가 아니라는 것은, 데이터에 쉽게 접근할 수 없도록 하는 효과를 가져옵니다.
* Graphene Relay를 사용했을 때 어떤 형태로 graphql로 접근할 수 있는지에 관한 약속을 기억하는 것이 필요한 것 같습니다.
  * python에서는 `_`를 사용하여 작성한 것이, graphql로 접근할 때는 camelCase가 됩니다.

* GraphQL에는 Query를 통해서 데이터에 접근만 할 수 있는 것이 아닙니다. Mutation을 통해 데이터의 변경을 가져올 수도 있습니다. 이에 대해서는 다음 글에서 알아봅니다.