---
layout: post
title:  "Django Graphene 튜토리얼 따라하기 4"
date:   2020-01-01 15:50:00 +0700
categories: [django, graphql, relay]
---

> GraphQL Schema에 대하여 좀 더 알아보면서,
>
> mutation을 추가하는 방법에 대하여 알아봅니다.

[Github 소스코드](https://github.com/leesungbin/graphene_tutorial) 





# 7. `graphene.Schema` - Mutation 추가

```python
import graphene

class Query(graphene.ObjectType):
  pass
class Mutation(graphene.ObjectType):
  pass
schema = graphene.Schema(query=Query, mutation=Mutation)
```

`graphene.Schema` 객체는 GraphQL 서버가 data 모델을 이해하도록, 그리고 각 method들을 resolve 해주는 역할을 합니다. 그래서 위와 같은 구조를 가져야 합니다.





root위치에 있는 `schema.py`를 변경해봅니다.

```python
# schema.py
import graphene
import ingredients.schema

class Query(ingredients.schema.Query, graphene.ObjectType):
    pass

# Mutation class 추가
class Mutation(ingredients.schema.RelayMutation, graphene.ObjectType):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)
```

* 우리는 RelayMutation에 해당하는 class를 작성해주면 됩니다.



```python
# ingredients/schema.py

# import 첫줄에서 추가로 import 합니다.
from graphene import relay, ObjectType, AbstractType, String

# ...

# 맨 밑에 다음 코드를 작성해봅니다.

# CategoryCreate 클래스는 Mutation 1개에 해당합니다.
# CategoryUpdate, CategoryDelete 와 같은 클래스 구현 방법은 github을 참고하세요.
class CategoryCreate(relay.ClientIDMutation):
    category = relay.Node.Field(CategoryNode)

    class Input:
        name = String(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **kwargs):
        name = kwargs.get('name')
        category = Category(name=name)
        category.save()
        return CategoryCreate(category=category)

# RelayMutation 클래스에는 Mutation들을 집어넣어주면 됩니다.
class RelayMutation(AbstractType):
    category_create = CategoryCreate.Field()

```

