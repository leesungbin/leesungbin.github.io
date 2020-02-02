---
layout: post
title: "TypeScript Generic에 대하여"
date: 2020-01-21 12:35:00 +0700
categories: [typescript]
published: false
---

> [링크](https://www.typescriptlang.org/docs/handbook/generics.html) 에 있는 TypeScript 공식 문서를 참고하여 글을 작성하였습니다.
>
> Generic이 무엇인지, TypeScript로 이를 어떻게 사용하는지에 대해서 알아봅니다.

<br/>

# 1. Generic?

어떤 한 컴포넌가 다양한 type의 데이터에 대하여 작동할 수 있도록 대비하는 방법이 있습니다.

그러나 왜 그렇게 해야할까요?

<br/>

우선 예를 들어, 전달 받은 값을 그대로 돌려주는  `identity`라는 함수가 다음과 같이 생겼다고 해보겠습니다.

```typescript
function identity(arg: number): number {
  return arg;
}
```

이 함수는 number 형태의 `arg`를 받아서 그대로 `arg`를 return 해 줍니다.

따라서 `const v1 = identyty(1);` 과 같이 코드를 작성한다면,

`v1` 의 타입은 `number` 인 것을 알 수 있습니다.

<br/>

만약 `arg`의 타입을  `any` 로 하여 `identity` 함수를 작성했다면,

```typescript
function identity(arg: any): any {
  return arg;
}
```

어떤 타입이 와도 `identity` 함수는 그대로 인자를 받아서 다시 return해 주겠지만,

(이는 어떠한 타입에 대해서도 결과를 돌려주기에 제너릭한 함수라고 할 수 있겠지요)

`const v2 = identity('string typed');` 과 같이 코드를 작성했을 때,

`v2`에 대해서 어떠한 정보도 얻을 수 없을 것입니다. `string` 타입이어야 할 텐데 말이지요.

<br/>

하지만 이 `identity` 함수를 다음과 같이 작성한다면,

```typescript
function identity<T>(arg: T): T {
  return arg;
}
```

`const v3 = identity<boolean>(true)` 와 같이 작성했을 때,

`v3`의 타입은 `boolean` 임을 알 수 있게 됩니다.

또한, `const v4 = identity(true)` 와 같이도 사용할 수 있습니다.

이는 컴파일러가 자동으로 `T`의 자리에 true의 타입인 `boolean`을 집어넣어주기 때문입니다.