---
layout: post
title:  "Django Graphene 튜토리얼 따라하기 1"
date:   2019-12-31 17:00:00 +0700
categories: [django, graphql, relay]
---

>  Graphene 라이브러리를 사용하여 GraphQL 서버를 만들어봅시다.

[Github 소스코드](https://github.com/leesungbin/graphene_tutorial) 





# 1. Django Project 초기 세팅

> 저는 다음 개발 환경에서 진행하였습니다.
>
> macOS Catalina v10.15
>
> Python3 v3.7.4
>
> fish shell v3.0.2



* 다음과 같이 프로젝트 세팅을 진행합니다.

```bash
python3 -m venv cookbook
cd cookbook

# 저는 fish shell을 사용하기 때문에 다음과 같이 가상환경을 실행시킵니다.
# 사용하는 shell에 맞게 가상환경을 실행시키시기 바랍니다.
source ./bin/activate.fish

pip install django graphene_django

django-admin startproject cookbook
cd cookbook
python manage.py startapp ingredients

python manage.py migrate
python manage.py runserver
```

* runserver 후 로켓이 날아다니는 화면을 보게 된다면 초기 세팅 성공입니다.



# 2. 모델 정의

* 먼저 Django의 모델을 설정합니다.

```python
# ingredients/models.py

from django.db import models

class Category(models.Model):
  name = models.CharField(max_length=100)
  def __str__(self):
    return self.name
  
class Ingredient(models.Model):
  name = models.CharField(max_length=100)
  notes = models.TextField()
  category = models.ForeinKey(Category, related_name='ingredients', on_delete=models.CASCADE)
  
  def __str__(self):
    return self.name
 
# 1개의 Category에 여러개의 Ingredient가 있을 수 있습니다.
# related_name 을 설정함으로써 Category.ingredients.all() 과 같이 접근할 수 있습니다.
```

 

* `cookbook/settings.py` 에 ingredients를  추가합니다.

```python
...
# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'ingredients'
]
...
```



* 바뀐 설정을 적용해줍니다.

```bash
# manage.py 가 있는 위치에서 진행합니다.
python manage.py makemigrations
python manage.py migrate
```



* 테스트 데이터가 있어야합니다.

  [링크](https://raw.githubusercontent.com/graphql-python/graphene-django/master/examples/cookbook/cookbook/ingredients/fixtures/ingredients.json) 에 있는 데이터를 복사하여, `ingredients/fixtures/ingredients.json` 파일을 만든 후 값을 붙여넣어줍니다.

  그 후, 아래 명령어로 데이터를 가져옵니다.

  ```bash
  python manage.py loaddata ingredients
  ```



* admin 사이트를 통해 데이터를 확인해봅시다.

  ```python
  # ingredients/admin.py
  from django.contrib import admin
  from cookbook.ingredients.models import Category, Ingredient
  
  admin.site.register([Category, Ingredient])
  ```

  ```bash
  # 이 명령어로 superuser 계정을 만듭니다.
  python manage.py createsuperuser
  ```

  그 후, localhost:8000/admin 으로 접근해봅니다.

  

* `ingredients/fixtures/ingredients.json` 에 있는 데이터가 그대로 들어와있으면 성공입니다.