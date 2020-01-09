---
layout: post
title: "Apollo로 풀스택하기 1"
date: 2020-01-09 19:16:00 +0700
categories: [apollo, graphql, nodejs, react, typescript]
---

>이 포스트에서는 Apollo를 사용하여 풀스택 서비스를 구현해봅니다.
>
>ES6 문법 기반으로, Typescript를 사용하여 진행할 것입니다.
>
>Apollo 문서가 제공하는 공식 튜토리얼을 타입스크립트를 사용하여 따라해본다고 생각하시면 됩니다. [링크](https://www.apollographql.com/docs/tutorial/introduction/)

<br/>

# 0. 진행할 것

우주 여행시 우주선의 자리를 예약하는 서비스를 개발해볼 것입니다. (에어비앤비의 우주여행판으로 생각해봅시다.)

우리는 [SpaceX-API](https://github.com/r-spacex/SpaceX-API) 의 데이터를 사용할 것입니다.

클라이언트(React)와 서버(Node.js)를 모두 구현해 볼 것이고, 먼저 서버를 개발 한 후, 클라이언트 개발을 진행합니다.

<br/>

이 튜토리얼을 따라하게 되면 로그인을 비롯하여, GraphQL을 사용하는 것에 대한 전반적인 이해도를 많이 높일 수 있을 것으로 생각합니다.

<br/>

> **시스템 요구사항은 아래와 같습니다.**
>
> * Node.JS v8.x 이상,
>
> * npm v6.x 이상
>
> * `VS-Code`로 프로젝트를 진행시 `Apollo Extension`이 도움을 줄 수 있습니다.

<br/>

# 1. 초기 개발환경 세팅

다음 command를 통해, 필요한 dependency와 파일 및 폴더를 생성합니다.

```bash
mkdir apollo_fullstack
cd apollo_fullstack
npm init -y

# tsconfig.json 파일 생성 (typescript 사용위해)
npm i --save-dev typescript
tsc --init

# apollo 개발을 위한 dependency 설치
npm i --save apollo-server graphql

mkdir src
cd src
touch index.ts
touch schema.ts
```

이렇게 되면 프로젝트 구조는 다음과 같습니다.

```
.
├── node_modules
│   └── ...
├── package-lock.json
├── package.json
├── src
│   └── index.ts
│   └── schema.ts
└── tsconfig.json
```

<br/>

# 2. Schema 작성

```typescript
// src/schema.ts
import { gql } from 'apollo-server';
export const typeDef = gql`
  type Query {
    launches: [Launch]!
    launch(id: ID!): Launch
    me: User
  }

  type Launch {
    id: ID!
    site: String
    mission: Mission
    rocket: Rocket
    isBooked: Boolean!
  }

  type Rocket {
    id: ID!
    name: String
    type: String
  }

  type User {
    id: ID!
    email: String!
    trips: [Launch]!
  }

  type Mission {
    name: String
    missionPatch(size: PatchSize): String
  }

  enum PatchSize {
    SMALL
    LARGE
  }
`;
```

`src/schema.ts` 파일에 정의된 typeDef가 우리가 사용할 graphql schema 입니다.

우리가 `Query`로 접근할 수 있는 목록은 launches, launch, me 이렇게 세가지 이고, 각 요소는 그 하단부에 그 내용이 적혀있습니다.

각 타입에 `!`가 붙어있는 것은 반드시 필요한, 값이 존재해야하는 타입이고, `!`가 없으면 해당 값은 없을 수도 있는 값입니다.

<br/>

웹 서비스에는 `Query`를 통해 값에 접근할 수도 있어야하지만, `Mutation`을 통해 값이 변경될 수도 있어야합니다.

따라서 우리가 사용할 `Mutation`의 타입도 작성해줍니다.

```typescript
// src/schema.ts

// ...

  type Mutation {
    bookTrips(launchIds: [ID]!): TripUpdateResponse!
    cancleTrip(launchId: ID!): TripUpdateResponse!
    login(email: String): String
  }

  type TripUpdateResponse {
    success: Boolean!
    message: String
    launches: [Launch]
  }
`;
```

* 여행을 예약 및 취소, 그리고 로그인 하는 기능이 뮤테이션에 해당합니다.
* 여행을 예약하거나 취소할 시에는 `luanch` 에 대한 `ID` 로 `launch`에 접근합니다. 그리고 값을 변경한 후, `TripUpdateResponse` 형식의 데이터를 그 결과로 보여줄 것입니다.
* 로그인 할 때 필요한 요소는 이메일이고, 결과로는 String token을 제공해줄 것입니다.

<br/>

# 3. Apollo 서버 생성

이제 `src/index.ts` 파일을 작성해봅니다.

```typescript
// src/index.ts

import { ApolloServer } from 'apollo-server';
import { typeDefs } from './schema';

const server = new ApolloServer({ typeDefs });
server.listen().then(({url}) => { console.log(`Server running on ${url}`)});
```

* 우리가 작성한 schema를 가져와서 서버에 띄우는 형식입니다.

<br/>

`package.json` 내부의 scripts를 수정하여 서버 실행 방법을 지정하겠습니다.

```json
{
#  ...
  "scripts": {
    "server": "ts-node src/index.ts"
  },
# ...
}
```

`npm run server` 명령어로 서버를 실행할 수 있도록 하였습니다.

> 저는 global하게 `ts-node`와 `typescript`를 설치해놓았습니다.
>
> ```bash
> npm install -g ts-node
> npm install -g typescript
> ```
>
> 위 명령어로 설치하여, `ts-node` 로 ts파일을 바로 컴파일하여 실행해볼 수 있습니다.

<br/>

이제 `http://localhost:4000`으로 접근해보면 GraphQL Playground가 실행되는 모습을 볼 수 있고, 우측에는 우리가 입력한 스키마를 확인해볼 수 있습니다.

![img](/assets/apollo-fullstack/1/playground.png)

아직 data도 없고, 각 항목에 대한 resolver를 작성해보지 않았기 때문에, 작동하는 query를 작성할 수는 없습니다.

다음 글에서 Space-X API에 접근하여 REST API를 GraphQL로 파싱하는 방법을 알아봅니다.

