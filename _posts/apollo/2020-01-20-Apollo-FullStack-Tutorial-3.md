---
layout: post
title: "Apollo로 풀스택하기 3"
date: 2020-01-20 20:51:00 +0700
categories: [apollo, graphql, nodejs, react, typescript, sqlite3]
published: false
---



# 5. SQLite3, Sequelize 세팅

```bash
npm i --save sqlite3 sequelize
sqlite3 store.sqlite3 # store.sqlite3 db 파일을 생성합니다.
# 그 후, ctrl+D 로 sql 창을 빠져나옵니다.
```

이 db 파일을 사용하기 위해 `src/util.ts` 파일을 생성합니다.

<br/>

```typescript
// src/util.ts
import { Sequelize, Op, INTEGER, DATE, STRING } from 'sequelize';

export function paginateResults({ after: cursor, pageSize = 20, results, getCursor }
  : { after: string, pageSize: number, results: any[], getCursor: (item?: { cursor?: string }) => null | string }) {
  if (pageSize < 1) return [];
  if (!cursor) return results.slice(0, pageSize);
  const cursorIndex = results.findIndex(item => {
    let itemCursor = item.cursor ? item.cursor : getCursor(item);
    return itemCursor ? cursor === itemCursor : false;
  });

  return cursorIndex >= 0
    ? cursorIndex === results.length - 1 ? []
      : results.slice(
        cursorIndex + 1,
        Math.min(results.length, cursorIndex + 1 + pageSize)
      )
    : results.slice(0, pageSize);
};

export function createStore() {
  const operatorsAliases = {
    $in: Op.in
  };

  const db = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: './store.sqlite3',
    operatorsAliases,
    logging: false,
  });
  const users = db.define('user', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    createdAt: DATE,
    updatedAt: DATE,
    email: STRING,
    token: STRING
  });

  const trips = db.define('trip', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    createdAt: DATE,
    updatedAt: DATE,
    launchId: INTEGER,
    userId: INTEGER,
  });

  return { users, trips };
};
```

* paginateResults 함수는 Query 할 때 기본적으로 20개씩 데이터를 잘라서 보여주는 역할을 합니다. (Query시 임의의 값을 줄 수도 있습니다.)
* paginateResults 함수의 마지막 부분에, 20개를 자를 때, overflow가 일어나지 않도록 조치되어있습니다.
* createStore 함수는 Sequelize를 사용하여 sqlite와 연결하는 역할을 합니다. user와 trip의 데이터 형태가 어떠한지를 정의합니다.



# 6. Query Resolver 작성

이제 query 요청을 해결해주는 resolver를 간단히 작성합니다. `src/resolver.ts` 파일을 생성합니다.

```typescript
// src/resolver.ts

```

