---
layout: post
title: "어떻게 해야 Go를 잘 쓸까 고민(Effective Go) 1"
date: 2020-02-02 19:04:00 +0700
categories: [golang, effectivego]
published: true
---

> Effective Go 문서를 읽어보면서, Golang에 대한 이해를 높이고 좋은 코드를 작성하는 것이 목표입니다.
>
> (Introduction, Formatting, Commentary, Names, Semicolons)

<br/>



## Introduction

C++이나 Java로 작성된 코드를 Go로 번역하는 것은 좀처럼 만족스러운 결과를 내지 않습니다. Go 언어로 프로그램을 작성할 때, 훌륭한 결과를 가져올 수 있으나, C++나 Java로 만들었을 때와는 전혀 다른 프로그램이 되어있을 수 있습니다. Go 언어를 잘 사용하기 위해서는 Go언어의 특징에 대해서 잘 이해하고 있어야할 필요가 있습니다. Naming, formatting, program construction 등등 Go 언어에서 어떻게 사용해야 잘 사용하는 것일지 살펴봅니다.

<br/>

## Formatting

개발자에게는 각자 원하는 코드 formatting 스타일이 있습니다. 이 formatting 스타일은 가장 논란이 많지만 반면에 프로그램 입장에서는 별로 중요하진 않습니다. Go에서는 이에 대한 논란을 줄이기 위해 `gofmt` 프로그램으로 formatting 스타일을 통일하여 이 issue를 해결하도록 합니다. 즉, 모든 Go 코드는 `gofmt`가 그 형식을 맞춰줍니다.

* 들여쓰기 : tab 사용
* 한 줄에 길이제한 없음
* 괄호를 적게 사용(vs C, Java): if, for, switch등에 괄호 사용하지 않음

<br/>

## Commentary

* `/* */` : block comments
* `//`: line comments

위 두가지 형태의 주석 사용 가능합니다.

모든 package는 그 package에 해당하는 주석이 있는 것이 좋다. 주석은 해당 패키지 선언 이전에 있는 것이 좋습니다. 한 패키지 안에 여러개의 파일이 있을 경우, 패키지에 대한 주석은 파일 한개에만 있으먼 됩니다.

코멘트는 gofmt가 포매팅 처리하지 않는다. 그저 일반 텍스트일 뿐입니다.

변수 선언시 관련 있는 변수들끼리 그룹지어 선언하고, 그에 대한 주석을 남긴다면 해당 그룹이 뭐와 관련된 변수인지 알기 좋을 것 입니다.

```go
// Error codes returned by failures to parse an expression.
var (
    ErrInternal      = errors.New("regexp: internal error")
    ErrUnmatchedLpar = errors.New("regexp: unmatched '('")
    ErrUnmatchedRpar = errors.New("regexp: unmatched ')'")
    ...
)
```

그룹으로 선언하는 것 자체만으로 해당 변수들이 어떤 작업과 관련있는 변수임을 나타낼 수 있을 것 입니다.

<br/>

## 이름 잘 짓기

### 패키지 이름

변수명, 또는 함수명의 첫 글자가 대문자인지, 소문자인지가 외부에서의 접근 가능 유무를 나눕니다. 대문자여야 접근 가능합니다.

```go
import "fmt"
```

`fmt.Println` 함수를 사용할 때를 살펴보면, `fmt`라는 패키지명은 간결하고, 소문자이며 한개의 단어로 되어있습니다. 밑줄(`_`)이나 camelCase를 사용하여 패키지명을 짓는 것은 좋지 않습니다. 패키지 명이 겹칠 것은 걱정하지 않아도 된다. 이를 접근할 때 alias를 설정하여 변경할 수 있습니다.

#### 패키지를 import 할 때 

`bufio` 패키지에 있는 `Reader` 함수를 예를 들면, 이 함수는 `BufReader` 같은식으로 작명되지 않았습니다. 왜냐하면, `bufio.Reader`와 같이 사용함으로써 '아 buffered reader 타입에 접근하는구나' 를 알 수 있기 때문입니다. 또한, import된 패키지에 있는 속성들은 서로 다른 패키지명으로 접근되기 때문에, `bufio.Reader`와 `io.Reader`는 서로 충돌되지 않습니다. 

또한, 새로운 객체를 만드는 생성자를 만들 때에도 살펴봅시다. 예를들어 `ring.Ring` 과 같이 Ring이라는 객체를 생성하는 것이 목적이라면, `ring.New` 와 같이 사용하는 것이 좋습니다.(Ring만 export되는 거라면)

`once.Do(setup)` 은 한번에 잘 읽힙니다. 반면에 `once.DoOrWaitUntilDone(setup)` 과 같은 형식으로 사용된다면? 이는 잘 읽히지 않습니다. Go에서는 짧은 naming을 할 수 있도록 패키지 구조를 잘 사용하는 것이 좋다. 또한, 각 함수에 대한 주석을 잘 다는 것이 긴 name을 짓는 것보다 나을 수 있습니다.

<br/>

### Getters

Go는 getters와 setters를 자동으로 제공하지는 않습니다. 하지만, getters와 setters를 제공하는 것은 전혀 문제가 되지 않고, 이 방식이 적절할 때도 있습니다.

```go
owner := obj.Owner()
if owner != user {
  obj.SetOwner(user)
}
```

이 때, `obj.GetOwner` 보다는 `obj.Owner` 로 불리는 것이 좋습니다.

<br/>

### Interface 이름

One-method interface의 경우, method name 에 -er 을 붙이거나하는 식으로 정합니다. Ex) Reader, Writer, Formatter, CloseNotifier ...

다만,  Read, Write, Close, Flush, String 등등은 go의 standard 의미와 혼동될 수 있으므로, 같은 의미로 사용되는 것이 아니라면 이 이름을 사용하는 것은 좋지 않을 수 있습니다.

<br/>

### MixedCaps

MixedCaps 또는 mixedCaps 와 같이 이름을 정하며, mixed_caps 와 같은 식으로 여러개의 단어를 `_`로 잇지 않는것이 좋습니다.

<br/>

## Semicolons

C와 같이 Go에서도 semicolon을 사용하여 statement를 마무리 합니다. 그러나 C와 다른 것은 이 semicolon이 소스 코드에서는 나타나지 않는 다는 것입니다. Lexer가 간단한 규칙을 통해서 semicolon을 자동으로 붙입니다.

* 새 line의 마지막 토큰이 identifier에 해당할 경우 `ex) break / continue / fallthrough / return  ++  --  )  }` lexer가 항상 semicolon을 이 token 뒤에 붙입니다.

* Go 프로그램에서 semicolon을 사용할 때는 `for` loop를 사용할 때와 같이 initializer와 condition, continuation 조건을 설정할 경우 뿐입니다. 이 때는 한 줄에 여러가지 statements를 분리해야하기 때문에, 직접 사용해주어야합니다.

* identifier의 뒤에 semicolon이 오기 때문에, 다음과 같이 사용하면 안됩니다.

  ```go
  if i < f() // 여기에 semicolon이 붙으면 안되겠지요.
  {
    g()
  }
  ```

  따라서 다음과 같이 코드를 작성해야하는 것입니다.

  ```go
  if i< f() {
    g()
  }
  ```

<br/>

<br/>

## References

* https://golang.org/doc/effective_go.html