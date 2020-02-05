---
layout: post
title: "어떻게 해야 Go를 잘 쓸까 고민(Effective Go) 5"
date: 2020-02-05 13:38:00 +0700
categories: [golang, effectivego]
published: true
---

> Effective Go 문서를 읽어보면서, Golang에 대한 이해를 높이고 좋은 코드를 작성하는 것이 목표입니다.
>
> (The blank identifier, Embedding, Concurrency)

<br/>

## The blank identifier

blank identifier(`_`)를 사용한 코드는 이전 글에서도 여러번 목격했습니다. `_`는 어떤 타입에 대해서도 선언 될 수 있고, 선언된 값은 프로그램에 문제없이 버려집니다. Unix 체계에서 `/dev/null`에 파일을 쓰는 맥락과 비슷합니다.

### The blank identifier in multiple assignment

```go
if _, err := os.Stat(path); os.IsNotExist(err) {
  fmt.Printf("%s does not exist\n", path)
}
```

위와 같이, `os.Stat` 함수를 통해 얻는 값이 여러개이지만, err 만 필요한 경우, 필요하지 않은 값은  `_`로 받는, placeholder 역할을 해줄 수 있습니다. 가끔 err를 `_`로 받는 경우도 있지만, Go에서 이러한 패턴은 좋지 않습니다. error가 제공될 때는 이유가 있습니다.

```go
// 좋지 않은 예시 입니다.
fi, _ := os.Stat(path)
if fi.IsDir() {
  fmt.Printf("%s is a directory\n", path)
}
```

<br/>

### Unused imports and variables

패키지를 불러오거나 변수를 선언한 후 사용하지 않는 것은 error에 해당합니다. 불러온 후 사용하지 않는 것은 프로그램의 컴파일 속도를 느리게 합니다. 변수를 초기화한 후 사용하지 않는 것은 적어도 컴퓨팅 리소스를 낭비하는 것이고, 심각한 버그로 나타날 수도 있습니다. 그러나, 개발 과정에 있어서는 미리 불러와놓을 수도 있고, 변수를 미리 선언해놓을 수도 있는데, 이 때문에 컴파일이 진행되지 않는 것은 좀 불편합니다. 이런 상황에서 `_`를 활용하면 좋습니다.

다음과 같은 코드를 보면,

```go
package main

import (
  "fmt"
  "io"
  "log"
  "os"
)

func main() [
  fd, err := os.Open("test.go")
  if err != nil {
    log.Fatal(err)
  }
  // fd 를 사용해야함
]
```

io, fmt 패키지와 fd 라는 변수를 사용하지 않은 것을 확인 할 수 있습니다. 이를 다음과 같이 작성해봅니다.

```go
package main

import (
  "fmt"
  "io"
  "log"
  "os"
)

var _ = fmt.Printf // for debugging
var _ io.Reader // for debugging

func main() [
  fd, err := os.Open("test.go")
  if err != nil {
    log.Fatal(err)
  }
  // fd 를 사용해야함
  _ = fd
]
```

이런식으로 해놓으면, import 관련 error는 생기지 않으면서, 개발 진행 과정에서 해결해야될 과제로써 기억해놓기 쉽습니다.

<br/>

### Import for side effect (부작용이 아니라,, 약간 부수적인 효과?)

이전 예시에서 본 fmt나 io 같은 건 결국 사용하거나 지워지게 됩니다. 그런데 간혹 명시적으로 사용하지는 않지만 side effect를 위해 import해야되는 경우가 있습니다. 예를들어  `net/http/pprof` 패키지의 init 함수는 HTTP handler를 등록함으로써 디버깅 정보를 제공받을 수 있습니다. export 된 API도 존재하지만, 대부분은 handler를 등록하기 위해서 입니다. 이와 같은 상황에서, side effect를 위해 package를 import할 때 `_`를 사용하면 됩니다.

```go
import _ "net/http/pprof"
```

이런식으로 import 하게 되면 패키지가 side effect를 위해서 import 되었다는 것을 명확하게 알 수 있습니다.

<br/>

### Interface checks

interface를 implement할 때에는 타입을 명시적으로 선언하지 않아도 됩니다. 그 타입은 interface의 메소드를 implement함으로써 interface를 implement하게 됩니다. 대부분의 interface conversion은 컴파일 시 체크됩니다. 예를 들어, `io.Reader`을 인자로 받는것을 예상하는 함수에 `*os.File`형태를 전달하면, `*os.File`이 `io.Reader` interface를 implement하지 않는 한 컴파일 되지 않을 것 입니다.

interface check가 런타임에 일어날 때도 있습니다. `encoding/json`이 그 예시입니다. 이 패키지에는 `Marshaler` interface가 있습니다. JSON 인코더가 값을 받으면, 인코더는 받은 값을 JSON으로 marshaling하게 됩니다. 인코더는 이를 런타임에 `type assertion` 형식으로 체크합니다.

```go
m, ok := val.(json.Marshaler)
```

interface를 잘 implement했는지 에러 체크만이 필요한 상황이라면, blank identifier를 활용하면 되겠지요.

```go
if _, ok := val.(json.Marshaler); ok {
  fmt.Printf("value %v of type %T implements json.Marshaler\n", val, val)
}
```

implement한 타입이 interface에 실제로 만족하는지를 보장하는 것이 필ㄹ요할 때가 있습니다. 예를 들어, `json.RawMessage` 의 경우 custom JSON representation이 필요하고, 이는 `json.Marshaler`를 implement하는 것이 필요하지만, 컴파일러가 자동으로 인식하는 static conversion이 존재하지 않습니다. 만약 실수로 해당 타입이 interface에 적합하지 않게 된다면, JSON 인코더는 작동하지만 custom implementation을 사용하진 않을 것입니다. implementation이 잘 맞다는 것을 보증하기 위해서, `_`를 사용한 global한 선언이 필요합니다.

```go
var _ json.Marshaler = (*RawMessage)(nil)
```

`_`는 type checking을 할 때 필요한 것이고, 새롭게 변수를 만들기 위해서가 아닙니다. 위와 같은 작업을 모든 interface에 대해서 하지 마시길 바랍니다. 위와 같은 경우는 static conversion이 존재하지 않는 매우 드문 경우입니다.

<br/>

## Embedding

interface embedding은 간단합니다. `io.Reader`, `io.Writer` 인터페이스는 다음과 같은 정의를 갖고 있습니다.

```go
type Reader interface {
  Read(p []byte) (n int, err error)
}

type Writer interface {
  Write(p []byte) (n int, err error)
}
```

위와 같은 경우, Reader interface 는 Read라는 함수가 있을 거라고 embedding 해놓은 것입니다.

`io.ReadWriter`  는 `Read` 와 `Write`를 둘 다 가진 interface입니다. 이와 같은 선언을 하기 위해서는 다음과 같이 하면 됩니다.

```go
type ReadWriter interface {
  Reader
  Writer
}
```

`Read`, `Write` 메소드를 명시적으로 나열해도 되지만, 위와 같은 방식이 더 쉽고 연상하기 좋습니다.

<br/>

## Concurrency

### Share by communicating

> Do not communicate by sharing memory; instead, share memory by communicating.

Go의 입장에서 동시성 프로그래밍(Concurrent programming)에 대해서 살펴봅니다. 이는 위의 문장으로 요약될 수 있습니다. Concurrent Programming의 어려운 점은 동시에 접근하게 되는 변수와 관련해서 생깁니다. 공유되는 값은 **channel**을 통해서 전달됩니다. 이 값은 프로그램의 실행동안 분리된 쓰레드에 의해 동적으로 공유되지 않습니다. 1개의 goroutine만이 그 값에 접근할 수 있습니다. 맨 첫 문장이 이 내용을 슬로건과 같이 담고 있다고 볼 수 있습니다.

<br/>

### Goroutines

Go에서는 쓰레드, 코루틴, 프로세스 같은 단어 대신 *goroutine* 이라는 단어를 사용하면 됩니다. goroutine은 다른 goroutine이 같은 공간에 있는 동안 동시적으로 실행되는 함수입니다. goroutine을 사용하기 위해서는 `go` 라는 keyword를 사용하면 됩니다.

```go
go list.Sort()
```

goroutine을 실행할 때 함수 리터럴(function literal)이 전달될 수도 있습니다.

```go
func Announce(message string, delay time.Duration) {
  go func() {
    time.Sleep(delay)
    fmt.Println(message)
  }() // 괄호를 열고 닫음 - 함수를 실행해야되기때문
}
```

Go에서 function literal은 클로저입니다. 함수에 의해서 참조되고 있는 변수는 계속 살아있다는 것을 보장합니다. 다만 위의 예들은 함수가 언제 종료되는지에 관한 정보를 알 수가 없습니다. 따라서 우리는 channel을 사용하여 이를 극복합니다.

<br/>

### Channels

map 같이, channel은 `make`로 할당 됩니다. 그 결과로써 갖는 값은 데이터에 대한 참조로써 활동합니다. channel의 buffer size의 기본값은 0입니다.

```go
ci := make(chan int)
cj := make(chan int, 0)
cs := make(chan *os.File, 100)
```

channel을 잘 사용하는 예시는 여러가지가 있습니다. 다음 예시는 sort가 끝난 뒤의 시점을 channel을 통해 알 수 있도록 하는 것입니다.

```go
c := make(chan int)

go func() {
  list.Sort()
  c <- 1 // sort완료된 신호 보내기; 값은 별 의미 없음 (송신부)
}
doSomethingForAWhile()

// sort가 끝나면 1이라는 값을 받게 됨. 현재는 이 값을 다른 변수에 저장하지 않고 버림
<-c // (수신부)
```

수신부는 송신부로부터 값을 받을 때 까지 block 되고, unbuffered channel이면 송신부는 수신부가 값을 받을 때 까지 block됩니다. Bufferd channel이면 값이 버퍼에 복사될 때 까지만 송신부가 block됩니다.

buffered channel은 semaphore 처럼 사용될 수 있습니다. 다음 예시를 확인해봅시다.

```go
var sem = make(chan int, MaxOutstanding)

func handle(r *Request) {
  sem <- 1
  process(r)
  <-sem
}

func Serve(queue chan *Request) {
  for {
    req := <-queue
    go handle(req)
  }
}
```

하지만 위 예시의 문제는, `sem`의 length는 `MaxOutstanding`만큼인데  `Serve` 함수가 들어오는 request마다 새로운 goroutine을 생성한다는 것입니다. 만약 요청들이 빠른 속도로 들어온다면, 결과적으로 프로그램은 무제한적으로 resource를 소비할 수도 있습니다. 이에 대한 솔루션은 다음과 같습니다.

```go
func Serve(queue chan *Request) {
  for req := range queue {
    sem <- 1
    go func() {
      process(req) // buggy한 부분
      <-sem
    }
  }
}
```

다만 여기서 생길 수 있는 문제는, `for` loop에서 loop variable은 반복문을 돌때마다 재사용되는데, `req` 변수가 모든 goroutine에서 공유된다는 것입니다. 우리는 `req`가 각 goroutine마다 유일하게 해주어야합니다. 그래서 다음과 같이 클로저를 사용하여  `req`를 goroutine 생성시 인자로써 넘겨줍니다.

```go
func Serve(queue chan *Request) {
  for req := range queue {
    sem <- 1
    go func(req *Request) {
      process(req)
      <-sem
    }(req)
  }
}
```

다른 방식은 그냥 같은 이름으로 새로운 변수를 만드는 것입니다.

```go
func Serve(queue chan *Request) {
  for req := range queue {
    req := req // **
    sem <- 1
    go func() {
      process(req)
      <-sem
    }()
  }
}
```

`req := req` 가 이상하게 보일 수 있지만, Go에서는 굉장히 관용적인 표현입니다. 의도적으로 loop variable을 지역적으로 가리게 되고, 각 goroutine별로 유일한 값이 됩니다.

<br/>

### Parallelization

멀티코어 CPU에서 계산을 병렬처리 하는 것에 대해서도 channel을 사용하면 된다.

vector의 각 요소별로 무거운 계산(**Op**eration)을 해야한다고 했을 때, 다음과 같이 코드를 작성했다고 해보자.

```go
type Vector []float64

func (v Vector) DoSome(i, n int, u Vector, c chan int) {
  for ; i < n;i++ {
    v[i] += u.Op(v[i])
  }
  c <- 1 // 끝을 알리는 신호
}
```

이를 각 CPU별로 독립적인 연산을 처리하게 하려면 다음과 같이 하면 된다. 몇 번째 연산이 일찍 마무리되든지 상관 없다. 연산이 마무리되는 시점만 카운트 해주면 된다.

```go
const numCPU = 4 // CPU 코어 갯수

func (v Vector) DoAll(u Vector) {
  c := make(chan int, numCPU)
  for i := 0; i < numCPU; i++ {
    go v.DoSome(i*len(v)/numCPU, (i+1)*len(v)/numCPU, u, c)
  }
  for i := 0; i < numCPU; i++ {
    <-c // 각 task가 끝날 때까지 기다림
  }
  // 모든 연산이 마무리 되는 시점
}

```

CPU 갯수를 상수로 주는 대신 `runtime.NumCPU` 함수를 사용해도 된다.

```go
var numCPU = runtime.NumCPU()
// 또는 var numCPU = runtime.GOMAXPROCS(0)
```

<br/>

<br/>

## References

* https://golang.org/doc/effective_go.html
* https://github.com/golangkorea/effective-go/blob/master/concurrency.md