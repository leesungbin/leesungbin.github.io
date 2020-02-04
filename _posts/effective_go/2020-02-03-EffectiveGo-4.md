---
layout: post
title: "어떻게 해야 Go를 잘 쓸까 고민(Effective Go) 4"
date: 2020-02-03 22:38:00 +0700
categories: [golang, effectivego]
published: true
---

> Effective Go 문서를 읽어보면서, Golang에 대한 이해를 높이고 좋은 코드를 작성하는 것이 목표입니다.
>
> (Initialization, Methods, Interfaces and other types)

<br/>

## Initialization

### Constants

Go에서의 상수는 어떤 함수 내부에서 지역변수로 선언되더라도, 컴파일타임에 생성됩니다. 그리고 그 값은 숫자, 문자, 문자열, boolean 타입만이 될 수 있습니다. 즉, 상수를 정의할 때는 컴파일타임에 생성된다는 것을 유의하여야 합니다.

`1<<3`은 괜찮지만, `math.Sin(math.Pi/4)`와 같이는 상수를 정의할 수 없습니다. 왜냐하면 `math.Sin`은 런타임에 동작하는 함수이기 때문입니다.

어떤 순서에 의한 상수를 만들 때에는 `iota` enumerator를 사용하면 좋습니다. `iota`는 `const` 내부에서 사용될 때 0으로 값이 초기화되고, 이 그룹안에서 1씩 증가합니다. 다음 예시를 참고하면 이해가 좀 됩니다.

<img src="https://camo.githubusercontent.com/a375bc9aaf7f25c99104936003d3a72f28da4225/68747470733a2f2f63646e2d696d616765732d312e6d656469756d2e636f6d2f6d61782f323030302f312a7366414854337a6b2d576a7853445249444d706461412e676966" alt="iota작동방식" style="zoom:50%;" />

```go
type ByteSize float64
const (
  _           = iota // iota가 0일 때에는 일단 무시합니다.
  KB ByteSize = 1 << (10 * iota)
  MB
  GB
  TB
  PB
  EB
  ZB
  YB
) // MB ~ YB는 KB에서 사용한 동일한 표현에, iota값이 변화하면서 값이 할당 됩니다.
```

임의로 지정한 타입인 `ByteSize` 타입에 `String` 메소드 같은 것을 붙일 수 있습니다. 적절한 용량에 맞는 string을 return하는 메소드가 되겠습니다.

```go
func (b ByteSize) String() string {
  switch {
  case b >= YB:
    return fmt.Sprintf("%.2fYB", b/YB)
  case b >= ZB:
    return fmt.Sprintf("%.2fZB", b/ZB)
  case b >= EB:
    return fmt.Sprintf("%.2fEB", b/EB)
  case b >= PB:
    return fmt.Sprintf("%.2fPB", b/PB)
  case b >= TB:
    return fmt.Sprintf("%.2fTB", b/TB)
  case b >= GB:
    return fmt.Sprintf("%.2fGB", b/GB)
  case b >= MB:
    return fmt.Sprintf("%.2fMB", b/MB)
  case b >= KB:
    return fmt.Sprintf("%.2fKB", b/KB)
  }
  return fmt.Sprintf("%.2fB", b)
}
```

<br/>

### Variables

변수도 상수처럼 초기화 시킬 수 있습니다. 런타임에 실행되는 일반적인 expression이 되어도 상관 없습니다.

```go
var (
  home   = os.Getenv("HOME")
  user   = os.Getenv("USER")
  gopath = os.Getenv("GOPATH")
)
```

<br/>

### The init function

모든 소스파일은 자신의 init 함수를 가질 수 있습니다.

<img src="https://astaxie.gitbooks.io/build-web-application-with-golang/en/images/2.3.init.png?raw=true" alt="init함수의 호출 순서" style="zoom: 67%;" />

위 그림은 init 함수의 호출 순서를 표현한 그림입니다. const나 var 로 선언한 변수들의 초기화 작업이 완료되고 나면 init 함수가 실행되게 됩니다.

보통 init함수는 프로그램의 작업이 시작되기 전에 해당 작업이 잘 실행될 수 있는지를 검증 및 오류가 발생할 수 있는 부분을 수정하는 역할로 사용합니다.

```go
func init() {
  if user == "" {
    log.Fatal("$USER not set")
  }
  if home == "" {
    home = "/home/" + user
  }
  if gopath == "" {
    gopath = home + "/go"
  }
  // command line으로 실행될 때 gopath가 제공된다면 override해야하겠지요.
  flag.StringVar(&gopath, "gopath", gopath, "override default GOPATH")
}
```

<br/>

## Methods

### Pointers vs. Values

위의 `ByteSize` 타입에서 봤듯, method는 어떤 타입에도 생성될 수가 있습니다.

```go
type ByteSlice []byte

func (slice ByteSlice) Append(data []byte) []byte {
  // 이전 글의 Slice를 설명할 때 있던 Append코드와 동일하면 되겠지요.
}
```

위와 같은 코드에서는 slice의 type이 포인터가 아니기 때문에 return해주는 작업이 필요합니다. 이를 포인터로 바꾸어 다시 함수를 만들려면,

```go
func (p *ByteSlice) Append(data []byte) {
  slice := *p
  // 이전 Append 함수와 동일한 body
  *p = slice
}
```

위와 같이 작성하고, return은 하지 않아도 될 것입니다. 이를 좀 더 나은 코드로 변경시키면 다음과 같습니다.

```go
func (p *ByteSlice) Append(data []byte) (n int, err error) {
  slice := *p
  // 이전 Append 함수와 동일한 body
  *p = slice
  return len(data), nil
}
```

이렇게 되면, *ByteSlice는 표준 인터페이스인 `io.Writer` 형식을 만족하기 때문에, 다음과 같은 작업에 쓰일 수 있습니다.

```go
var b ByteSlice
fmt.Fprintf(&b, "This hour has %d days\n", 7)
```

value 메소드는 포인터나 value에 의해서도 실행될 수 있지만, 포인터 메소드는 오직 포인터에 의해서 실행될 수 있습니다. 포인터를 전달 받았을 때는 원본에 수정을 가할 수 있기 때문에, 이러한 법칙이 있습니다. 하지만 예외도 있습니다. 값이 addressable하면 위의 예같이 value의 포인터를 전달해줌으로써 실행될 수도 있습니다.

<br/>

## Interfaces and other types

### Interfaces

Go에서 `interface`는 객체가 어떻게 행동할 수 있을 지에 대한 방법을 제공합니다.

> For example, a `Dog` can `walk` and `bark`. If an **interface** defines method signatures for `walk` and `bark` while `Dog` implements `walk` and `bark` methods, then `Dog` is said to **implement that interface**.
>
> https://medium.com/rungo/interfaces-in-go-ab1601159b3a

이전 항목에서 `ByteSlice`가 `io.Writer`의 형식에 맞기 때문에(io.Writer가 제공하는 method를 만족), `fmt.Fprintf` 첫 인자 자리에 사용될 수 있다는 것을 확인했습니다. ByteSlice type이 io.Writer 인터페이스를 implement 했다고 할 수 있습니다. 하나의 타입은 여러개의 interface를 implement할 수 있습니다.

예를 들어, `sort.Interface`를 implement하기 위해서는 `Len`, `Less`, `Swap` 메소드가 존재해야합니다. 다음 코드를 봅시다.

```go
type Sequence []int

// to implement sort.Interface
func (s Sequence) Len() int {
  return len(s)
}
func (s Sequence) Less(i, j int) bool {
  return s[i] < s[j]
}
func (s Sequence) Swap(i, j int) {
  s[i], s[j] = s[j], s[i]
}

// Custom method
func (s Sequence) Copy() Sequence {
  copy := make(Sequence, 0, len(s))
  return append(copy, s...)
}

// 출력을 위한 method
// s = []int{1,2,3,4} 라면
// s.String() 의 결과는 [1 2 3 4] 일 것
func (s Sequence) String() string {
  s = s.Copy() // 원본에 수정을 가하지 않기 위해서 Copy
  sort.Sort(s) // s는 sort.Interface를 만족하므로 sort.Sort에 전달 가능
  str := "["
  for i, elem := range s {
    if i > 0 {
      str += " "
    }
    str += fmt.Sprintf(elem)
  }
  return str + "]"
}
```

<br/>

### Conversions

위에서 작성된 `Sequence`의 `String` 메소드는 `Sprintf`가 기본으로 해주는 작업을 굳이 for문으로 만들었기 때문에 시간 복잡도를 증가시킬 뿐입니다. `String` 메소드를 사용했을 때처럼 원하는 결과를 얻으려면 `Sequence`타입을 `[]int`로 변경시켜주어야 합니다. 다음과 같이 작성합니다.

```go
func (s Sequence) String() string {
  s = s.Copy()
  sort.Sort(s)
  return fmt.Sprintf([]int(s))
}
```

`Sequence`와 `[]int`는 이름만 빼면 같은 타입을 가리키고 있기 때문에, 이런 작업이 가능합니다. 이 변환(Conversion)과정에서 새로운 값이 생성되는 것은 아닙니다. 잠시 `Sequence`가 `[]int`의 탈을 쓰는 것일 뿐입니다. (정수에서 실수로 변환하는 것도 가능하지만, 이 때는 새로운 값이 생성됩니다.)

Go에서는 타입을 변경시켜서 변경시킨 타입에 존재하는 메소드에 접근하도록 하는것이 관용적입니다. 따라서 우리가 지금까지 진행한 Sort 예시를 다음과 같이 간단하게 변경시킬 수 있습니다.

```go
type Sequence []int

// 출력시 정렬 된 결과를 출력하기. 원본에 변경을 가하진 않음
func (s Sequence) String() string {
  s = s.Copy()
  sort.IntSlice(s).Sort()
  return fmt.Sprintf([]int(s))
}
```

sort에 존재하는 `IntSlice` 타입으로 `[]int`타입으로 s를 conversion 한 후, `IntSlice`에 있는 Sort 메소드로 접근하여 정렬을 실시하게 되었습니다.

<br/>

### Interface conversions and type assertions

2번 글에서의 **Type switches** 는 conversion의 한 형태라고 볼 수 있습니다. interface의 각 case별로 원하는 타입으로 변경할 수 있겠지요. 다음 예시는 `fmt.Printf`가 어떻게 type switch를 통해 사용하는지를 간략히 나타낸 코드입니다.

```go
type Stringer interface {
  String() string
}

var value interface{} // provided by caller.
switch str := value.(type) {
case string:
  return str
case Stringer:
  return str.String()
}
```

만약 특정한 한개의 타입에 대해서만 고려해야한다면, `type assertion`, 타입을 주장해주는 것이 필요합니다. `type assertion`은 다음과 같이 하면 됩니다.

```go
value.(typeName) // typeName에 진짜 타입 이름을 써주는 겁니다.

str := value.(string) // string 타입을 가져가려면 이와 같이 작성하면 됩니다.
```

그런데 만약 `string` 타입이 존재하지 않는다면 프로그램은 런타임 에러를 일으킬 것입니다. 이를 방지하기 위해서 다음과 같이 작성하면 안전합니다.

```go
str, ok := value.(string)
if ok {
  fmt.Printf("string value is %q\n", str)
} else {
  fmt.Printf("value is not a string\n")
}
```

`type assertion`이 실패할 경우 `str` 은 string 타입을 갖지만, zero value인 빈 문자열을 갖게 됩니다. 위 코드는 다음과 같이 쓰면 좀 더 Go스럽다고 할 수 있겠습니다.

```go
if str, ok := value.(string); ok {
  fmt.Printf("string value is %q\n", str)
} else {
  fmt.Printf("value is not a string\n")
}
```

<br/>

### Generality

어떤 타입이 interface를 implement 하기 위해서만 존재하고, export된 메소드가 존재하지 않을 거라면, 그 타입은 export될 필요는 없습니다. Interface를 export하는 것은 interface에 있는 메소드를 통한 특정한 일이 일어나지 않을 거라는 것을 그냥 명확하게 할 뿐입니다.

<br/>

### Interface and methods

`http` 패키지의 `Handler` 인터페이스를 살펴보면, 어떤 객체든 `Handler` 인터페이스를 implement 하면 HTTP request를 보낼 수 있게 됩니다.

```go
type Handler interface {
  ServeHTTP(ResponseWriter, *Request)
}
```

`ResponseWriter`는 클라이언트에게 결과를 전달해주기 위해 필요한 메소드에 접근할 수 있도록 하는 인터페이스 입니다. 그 메소드는 표준 `Write` 메소드를 포함하고 있어서, `http.ResponseWriter` 은 `io.Writer`가 사용될 수 있는 곳에도 사용될 수 있습니다. `Request`는 클라이언트로부터 온 요청이 parsing된 형태로 되어있어야합니다.

`POST` 요청에 대해서는 무시하고, HTTP 요청이 `GET` 요청만 받는다고 해 봅시다.

```go
type Counter struct {
  n int
}

func (ctr *Counter) ServeHTTP(w http.ResponseWriter, req *http.Request) {
  ctr.n++
  fmt.Fprintf(w, "counter = %d\n", ctr.n)
}
```

http 요청이 들어올 때마다 n이 증가하도록 하는 코드가 작성되었습니다.

url로 접근하게 하려면 다음과 같은 코드가 필요하겠죠.

```go
import "net/http"
...
ctr := new(Counter)
http.Handle("/counter", ctr)
```

`Counter`를 struct로 할 필요는 없었습니다. 그냥 integer로만 해도 되었습니다.

만약 어떤 사용자가 임의의 페이지에 접근한 것을 알 수 있는 상태가 필요하다면 channel을 사용하면 되겠습니다.

```go
type Chan chan *http.Request

func (ch Chan) ServeHTTP(w http.ResponseWriter, req *http.Request) {
  ch <- req
  fmt.Fprint(w, "notification sent")
}
```

어떤 타입이든 `Handler` 인터페이스에 있는 `ServeHTTP` 메소드를 추가함으로써 handler 차리에 전달될 수 있습니다. 그렇다는 것은 함수를 타입으로 갖는 것도 가능하다는 것입니다.

예를들어 `/args`로 접근했을 경우, 서버를 실행할 때 전달된 인자를 볼 수 있도록 한다고 해봅시다. 우선 다음과 같은 함수가 필요하겠습니다.

```go
func ArgServer() {
  fmt.Println(os.Args)
}
```

이 함수를 HTTP 서버로 어떻게 가져와야할까요? `http` 패키지에는 다음과 같은 코드가 있습니다.

```go
// The HandlerFunc type is an adapter to allow the use of
// ordinary functions as HTTP handlers. If f is a function
// with the appropriate signature, HandlerFunc(f) is a
// Handler object that calls f.
type HandlerFunc func(ResponseWriter, *Request)

// ServeHTTP calls f(w, req).
func (f HandlerFunc) ServeHTTP(w ResponseWriter, req *Request) {
  f(w, req)
}
```

`HandlerFunc`는 `ServeHTTP`를 메소드로 갖는 타입입니다. 즉 어떤 함수가 `ResponseWriter`, `*Request`를 인자로 가진다면 `HandlerFunc` 타입을 implement한다고 볼 수 있겠습니다. 그래서 `ArgServer` 함수를 다음과 같이 수정합니다.

```go
func ArgServer(w http.ResponseWriter, r *http.Request) {
  fmt.Fprintln(w, os.Args)
}
```

이를 HTTP Server에서 사용할 수 있도록 `http.HandlerFunc()`으로 conversion 시켜주면 되겠습니다.

```go
http.Handle("/args", http.HandlerFunc(ArgServer))
```

사용자가 `/args`로 접근하면, `Argserver` 함수를 호출하게 되어 arguments를 볼 수 있을 것입니다.

<br/>

## References

* https://golang.org/doc/effective_go.html
* https://github.com/golang/go/wiki/Iota
* http://pyrasis.com/book/GoForTheReallyImpatient/Unit12
* https://mcauto.github.io/back-end/2019/01/23/go-init-function-problem/
* https://golang.org/pkg/flag/
* https://medium.com/rungo/interfaces-in-go-ab1601159b3a
* https://golang.org/pkg/sort/#IntSlice

