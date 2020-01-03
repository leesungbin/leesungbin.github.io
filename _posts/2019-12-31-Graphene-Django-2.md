---
layout: post
title:  "Django Graphene 튜토리얼 따라하기 2"
date:   2019-12-31 17:30:00 +0700
categories: [django, graphql, relay]
---

>  Graphene 라이브러리를 사용하여 GraphQL 서버를 만들어봅시다.

[Github 소스코드](https://github.com/leesungbin/graphene_tutorial) 





# 3. Schema 작성

* GraphQL Schema를 Django에서 사용하기 위해서 `schema.py` 에 Graphene 라이브러리를 사용한 schema가 정의되어야 합니다.
* GraphQL을 사용한다는 것은 데이터의 관계를 그래프 형태로 나타낸다는 것입니다. Graphene은 어떤 모델이 그래프에 나타나야할지 알아야합니다.

```python
# ingredients/schema.py
import graphene
from graphene_django.types import DjangoObjectType
from cookbook.ingredients.models import Cartegory, Ingredient

class CategoryType(DjangoObjectType):
  class Meta:
    model = Category
    
class IngredientType(DjangoObjectType):
  class Meta:
    model = Ingredient
    
class Query(object):
  all_categories = graphene.List(CategoryType)
  all_ingredients = graphene.List(IngredientType)

  # query 요청을 resolve해 주어야합니다.  
  # 모든 결과를 return 해줍니다.
  def resolve_all_categories(self, info, **kwargs):
    return Category.objects.all()
  
  def resolve_all_ingredients(self, info, **kwargs):
    return Ingredient.objects.select_related('category').all()
```

* `Query` class가 *root* 역할을 합니다. 즉, 이 `Query` class를 통해 데이터에 접근할 수 있게 됩니다.
* 각 model 별로 `DjangoObjectType` 의 class가 생겨야합니다.

* 현재 `Query` class는 `object` 를 상속합니다. 이 `object`는 project-level에 이제 생성할 schema.py 를 통해 상속됩니다.

```python
# schema.py
import graphene
import ingredients.schema
class Query(ingredients.schema.Query, graphene.ObjectType):
  # 이 부분은 나중에 추가됩니다.
  pass

schema = graphene.Schema(query=Query)
```



* 현재까지 한 작업을 적용하기 위해 몇 가지 설정을 추가해야합니다.

```python
# cookbook/settings.py

...
# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'ingredients',
  	'graphene_django' # 이 설정은 graphql_schema 관련 명령도 가능하게 합니다.
]
...

# 이 부분을 맨 밑에 추가해줍시다.
GRAPHENE = {
  'SCHEMA': 'schema.schema'
}
```



# 4. GraphQL Playground (`graphiql`)

* GraphQL playground를 만듭시다.

```python
# cookbook/urls.py
from django.contrib import admin
from django.urls import path

from graphene_django.views import GraphQLView

from schema import schema

urlpatterns = [
    path('admin/', admin.site.urls),
    path('graphql/', GraphQLView.as_view(graphiql=True, schema=schema)),
]
```



* `localhost:8000/graphql` 에 들어간 후,

  ```graphql
  query {
    allCategories {
      id
      name
      ingredients {
       	id
        name
      }
    }
  }
  ```

  

  위와 같은 쿼리를 날려봅시다. 다음과 같은 결과를 얻게 되면 성공입니다.

  ```json
  {
    "data": {
      "allCategories": [
        {
          "id": "1",
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
        },
        {
          "id": "2",
          "name": "Meat",
          "ingredients": [
            {
              "id": "3",
              "name": "Beef"
            },
            {
              "id": "4",
              "name": "Chicken"
            }
          ]
        }
      ]
    }
  }
  ```

  