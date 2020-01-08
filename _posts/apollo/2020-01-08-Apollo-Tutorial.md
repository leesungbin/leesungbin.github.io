---
layout: post
title: "Apollo 튜토리얼"
date: 2020-01-08 22:15:00 +0700
categories: [apollo, graphql, nodejs]
---

> Apollo 라이브러리를 사용하여, GraphQL 서버를 만드는 방법에 대하여 알아봅니다. [Apollo 공식 홈페이지](https://www.apollographql.com/docs/apollo-server/getting-started/) 의 내용을 따라해봅니다.

<br/>

# 1. 프로젝트 초기화

npm 프로젝트를 생성합니다. (Node.JS (8+) 버전이 설치되어있어야합니다. )

```bash
mkdir apollo_tutorial
cd apollo_tutorial
npm init -y
ls # package.json 파일이 생성되었는지 확인합니다.
```

<br/>

dependency를 설치합니다.

* apollo-server : `Apollo Server`를 만들기 위한 핵심 라이브러리입니다.
* graphql : GraphQL 스키마를 빌드하고, 쿼리를 통해 실행시키기 위한 라이브러리입니다.

```bash
npm install --save apollo-server graphql
```

node_modules 폴더가 생성되고, 이 안에 라이브러리들이 설치되었습니다.

<br/>

이제 index.js 파일을 생성 후, 라이브러리를 사용하는 코드를 작성해보겠습니다.

```bash
touch index.js
```

<br/>

# 2. GraphQL 스키마 정의

graphql 서버를 만들때에는

1. 데이터베이스의 형태를 알려주기
2. 요청을 해결해주는 resolver를 작성하기

이 두가지 작업을 해주어야 합니다.

```javascript
// index.js
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
	type Book {
	  title: String
		author: String
  }
	type Query {
		books: [Book]
	}
`;
```

* graphql 문법을 사용할 때, `gql` 을 사용하여 작성합니다.
* Book 이라는 타입은 우리가 직접 생성한 타입입니다. 그 안에는 제목과 작가가 String 형태로 담길 것입니다.
* Query 타입은 클라이언트가 최초로 접근하게 되는 graphql 예약어입니다.  `books` 로 Book 배열에 접근할 수 있게 될 것입니다.

현재는 아무런 데이터 없이, 그저 데이터의 흐름에 관한 정보를 작성한 것입니다.

이제는 직접 데이터를 주고, 요청을 해결해주는 resolver를 작성해보겠습니다.

<br/>

# 3. 간단한 Dataset 준비

```javascript
// index.js

// ...

const books = [
  {
    title: '창의성을 지휘하라',
    author: '에드 캣멀',
  },
  {
    title: '축구 전쟁',
    author: '윤동일',
  },
  {
    title: 'Transport Phenomena (2nd edition)',
    author: 'R. Byron Bird, Warren E. Stewart, Edwin N. Lightfoot',
  },
];
```

위와 같은 간단한 dataset을 준비해봅니다. books 객체의 각 요소들은 이전에 정의한 `Book` 타입의 형태와 일치합니다.

<br/>



# 4. Resolver 작성

```javascript
// index.js

// ...

const resolver = {
  Query: {
    books: () => books,
  }
}
```

위와 같은 resolver는 books를 쿼리 했을 경우, dataset으로 준비한 객체를 전부 리턴해주겠다는 것을 의미합니다.

<br/>



# 5. Apollo Server 생성

```javascript
// index.js
// ...
const server = new ApolloServer({ typeDefs, resolvers});
server.listen().then(({ url }) => { 
  console.log(`Listening on ${url}`);
});
```

ApolloServer 라이브러리가 요구하는대로, 작성된 graphql schema와 그에 해당하는 resolver를 차례대로 제공해준 후,

server를 실행시키도록합니다.

아래 명령어를 통해 서버를 실행시켜봅니다.

```bash
node index.js
```

<br/>

# 6. GraphQL Playground에서 결과 확인

`http://localhost:4000` 으로 접근하면, graphql playground가 실행되는 모습을 볼 수 있습니다.

여기서 다음과 같은 쿼리를 날려봅시다.

```graphql
query {
	books {
		title
		author
	}
}
```

그러면, dataset으로 준비한 내용을 전부 확인해 볼 수 있습니다.

* 제목만 필요하다면 author는 쿼리로 보내지 않아도 됩니다.
* 그러나, 준비되지 않은 필드에 대한 요청을 보내면 에러 메세지를 보게 됩니다.

