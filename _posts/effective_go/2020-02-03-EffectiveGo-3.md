---
layout: post
title: "어떻게 해야 Go를 잘 쓸까 고민(Effective Go) 3"
date: 2020-02-03 01:28:00 +0700
categories: [golang, effectivego]
published: true
---

> Effective Go 문서를 읽어보면서, Golang에 대한 이해를 높이고 좋은 코드를 작성하는 것이 목표입니다.
>
> (Data)

<br/>

## Data

### Allocation with `new`

Go 에는 두가지 메모리 할당 방법이 있습니다. `new`와 `make` 입니다. 이 두가지는 혼동될 수 있으나, 규칙은 꽤 간단합니다. 먼저 `new`에 대해서 알아보도록 하겠습니다. `new`는 메모리 할당을 하는 함수인데, 다른 언어에서와 같이 메모리를 초기화 하는 것은 아닙니다. 그저 0으로 만드는 것입니다. 즉, `new(T)` 와 같이 사용하면, T 타입의 값을 zero value로 할당하고 그 포인터를 return해 줍니다. T 타입의 값이 zero value인 새롭게 할당된 포인터를 return해 주는 것입니다.

이는 데이터 구조를 설계하는 것을 다룰 때 유용합니다. 별다른 초기화 작업 없이 zero value로 된 객체를 사용할 수 있게 되는 것입니다.

`bytes.Buffer`의 zero value는 빈 buffer이고, `sync.Mutex`는 명시적인 생성자나 Init 메소드가 없는 데신 zero value를 unlocked mutex의 형태로 정의합니다.

```go
// SyncedBuffer 타입은 할당 또는 그냥 선언을 통해 바로 사용될 수 있다.
type SyncedBuffer struct {
  lock   sync.Mutex
  buffer bytes.Buffer
}

// p, v는 별다른 초기화 작업 없이 바로 사용할 수 있다.
p := new(SyncedBuffer) // type : *SyncedBuffer
var v SyncdedBuffer    // type : SyncedBuffer
```

<br/>

### Constructors and composite literals

그러나 가끔, zero value로는 충분하지 않을 때가 있습니다. 초기화 생성자가 필수적일 때가 있습니다. 다음과 같은 경우를 살펴봅니다.

```go
func NewFile(fd int, name string) *File {
  if fd < 0 {
    return nil
  }
  f := new(File)
  f.fd = fd
  f.name = name
  f.dirinfo = nil
  f.nepipe = 0
  return f
}
```

이런식으로 사용하는 것은 불편합니다. 이를 다음과 같이 표현할 수 있습니다.

```go
func NewFile(fd int, name string) *File {
  if fd < 0 {
    return nil
  }
  f := File{fd, name, nil, 0}
  return &f
}
```

C와는 다르게, Go에서는 지역변수의 주소를 return하는것이 가능하고, 좋은 방법입니다. 함수가 return 될 때, 해당하는 변수의 저장 공간을 살려두기 때문입니다. 마지막 두 줄을 합쳐서

```go
return &File{fd, name, nil, 0}
```

과 같이 한줄로 표현할 수 있습니다. 다만 여기서 불편한 점은, 각 위치에 해당하는 값이 순서대로 들어가야하며, 4가지 값이 모두 있어야 한다는 것입니다. 이는 값에 라벨링을 함으로써 해결할 수 있습니다. 제공되지 않는 값은 zero-value를 가지면 되겠지요.

```go
return &File{fd: fd, name: name}
```

`newFile` 함수는 *File 형태의 값을 return하니까, `new(File)` 은 `&File{}` 과 같다고 할 수 있습니다. File{ ... } 이런식으로 작성하는 것을 `composite literal`을 이용한다고 말합니다. 이 `composite literal`은 arrays, slices, maps 에 다음과 같이 사용 될 수도 있습니다.

```go
a := [...]string{"no err", "Eio", "in"}
s := []string{"no err", "Eio", "in"}
m := map[string]interface{}{"name": "hihi", "age": 24}
```

<br/>

### Allocation with `make`

`make`는 `new`와는 좀 다릅니다. `make(T, args)` 와 같이 사용하며, slices, maps, channels를 만들 때 사용합니다. T 타입의 초기화된 값을 return 해줍니다. 포인터를 리턴해주는 것이 아닙니다.

예를들어 slice의 경우, 데이터의 포인터, length, capacity에 대한 값이 있기 전에는 nil에 불과합니다. make함수가 이 값을 초기화 해주는 작업을 해줍니다.

```go
make([]int, 10, 100) // make(type, length, capacity)
```

위 코드는, 100개의 int값이 담길 수 있는 공간을 할당하고, 길이가 10인 slice를 생성합니다. capacity는 생략될 수 있습니다.

```go
new([]int)
```

를 사용했다면, nil slice의 포인터를 갖게 되는 거겠지요.

그래서 slice를 생성할 때는 다음과 같이 하면 되겠습니다.

```go
v := make([]int, 100)

// new를 사용한다면..
var p *[]int = new([]int)
*p = make([]int, 100)
// 이렇게 되겠지만, 이런 방식은 불필요
```

<br/>

### Arrays

C와 Go의 차이점 중, Array와 관련해서는 다음과 같은 것들이 있습니다.

* Array는 값 자체이다.
* 특히, array를 함수에 전달할 때, 함수는 array의 copy된 것을 받는다. 포인터를 받지 않는다.
* Array의 크기 자체가 타입을 구별한다. `[10]int` 와 `[20]int`는 다른 타입이다.

C에서 사용되는 것과 같이 Go에서 사용하려면 다음과 같이 코드를 작성해야하지만, 이는 Go에서 관용적으로 사용되는 방식이 아닙니다. 이 방식 대신 Slice를 사용해야합니다.

```go
func Sum(a *[3]float64) (sum float64) {
  for _, v := range *a {
    sum += v
  }
  return
}
array := []float64{7.0, 8.5, 9.1}
x := Sum(&array)
```

<br/>

### Slices

Go에서 대부분의 Array 프로그래밍을 할 때는, 단순한 Array보다는 Slice를 사용하는 것이 좋습니다. Slice는 자신을 구성하는 array의 참조를 갖고 있습니다. 그래서 어떤 slice 변수를 다른 변수에도 저장하면 두 변수는 동일한 array를 참조하게 됩니다. 그래서 어떤 함수가 slice를 argument로 받아서 변경을 가하는 것은, C에서 함수에 배열을 포인터 형식으로 전달하는 것과 유사합니다.

```go
// 읽은 byte 수(n)과 error 값을 return 한다.
func (f *File) Read(buf []byte) (n int, err error)

// 어떤 버퍼의 첫 32 bytes를 읽으려면 다음과 같이 코드를 작성하면 된다.
n, err := f.read(buf[0:32])
```

slice의 길이는 변할 수 있다. 만약 slice의 capacity를 넘어선 data를 Append하려하면 error가 발생할 것이다. 이러한 문제를 해결할 수 있는 Append 함수는 다음과 같이 구현해볼 수 있다.

```go
func Append(slice, data []byte) []byte {
  l := len(slice)
  if l + len(data) > cap(slice) { // slice의 용량을 확장해야하는 상황
    // 용량을 확장한 slice를 생성한다.
    newSlice := make([]byte, (l+len(data))*2)
    // slice의 data를 newSlice로 복사한다.
    copy(newSlice, slice)
    // slice는 newSlice가 참조하는 array를 참조하게 한다.
    slice = newSlice
  }
  // 기존 데이터에, data를 붙였을 때
  // length 계산이 제대로 되게 하기 위해 다음과 같이 한다.
  slice = slice[0:l+len(data)]
  // slice의 기존 데이터 뒤에 data를 복사한다.
  copy(slice[l:], data)
  // Append작업이 끝난 slice를 return 해준다. **
  return slice
}
```

* Argument로 전달된 slice는 그저 값이 전달되는 것이기 때문에, 수정 된 slice를 함수의 실행 결과로써 전달해주지 않으면, 변경된 값을 가질 수 없다.

<br/>

### Two-dimensional slices

2D array, slice를 만들기 위해서는 다음과 같은 정의가 필요합니다.

```go
type Transform [3][3]float64
type LinesOfText [][]byte
```

slice의 길이는 변할 수 있기 때문에, rows 별로 slice의 길이는 다를 수 있습니다. 다음과 같은 작업이 가능합니다.

```go
text := LinesOfText{
  []byte("Now is the time"),
  []byte("for all good gophers"),
  []byte("to bring some fun to the party."),
}
```

어떤 이미지 파일의 pixel 별로 값을 스캔해야한다던지 하는 경우, 2차원 slice의 메모리를 할당해야할 필요가 있습니다. 각 row별로 length가 다를 수 있으므로, 다음과 같이 할당을 시켜야합니다.

```go
picture := make([][]uint8, YSize) // 줄 갯수
for i := range picture {
  picture[i] = make([]uint8, XSize) // 열 갯수
}
```

다음과 같은 방식도 가능합니다.

```go
picture := make([][]uint8, YSize)
pixels := make([]uint8, XSize*YSize)
// XSize만큼 자르면서 할당시키기
for i := range(picture) {
	picture[i], pixels = pixels[:XSize], pixels[XSize:]
}
```

<br/>

### Maps

key-value 데이터 구조를 만들기 위해 필요합니다. key에는 slice 타입 말고는 어떠한 타입도 key가 될 수 있습니다. Slice와 같이 map은 자신을 구성하는 데이터들의 참조를 갖습니다.

```go
// map 초기화
var timeZone = map[string]int{
  "UTC": 0*60*60,
  "EST": -5*60*60,
  "CST": -6*60*60,
  "MST": -7*60*60,
  "PST": -8*60*60,
  "KST": 9*60*60,
}
// map의 key를 통한 value 접근
offset := timeZone["KST"]
```

`timeZone` 변수에 없는 key를 접근하려하면 어떻게 처리되는지는 다음 코드를 통해 확인해 볼 수 있다.

```go
var seconds int
var ok bool
seconds, ok = timeZone[tz]

func offset(tz string) int {
  if seconds, ok := timeZone[tz]; ok {
    return seconds
  }
  log.Println("unknown time zone:", tz)
  return 0
}
```

map에 존재하는 `tz`로 접근하려하면 `seconds`는 올바른 값을 가질 것이고, 그렇지 못하면 에러 메세지와 함께 `seconds`는 0이 될 것이다.

map에 해당하는 key-value를 삭제하기 위해서는 다음과 같이 하면 된다. 존재하지 않는 key를 삭제하려해도 안전하다.

```go
delete(timeZone, "CST")
```

<br/>

### Printing

C의 `printf` 같이 Go에서 Formatted printing 방식이 있습니다. 근데 좀 여러가지 종류가 있습니다.

`fmt.Printf`, `fmt.Fprintf`, `fmt.Sprintf` 등이 있는데, `Sprintf` 같은 경우는 formatted string을 return해주는 역할을 하기도 합니다.

```go
fmt.Printf("%v\n", timeZone) // or just fmt.Println(timeZone)
```

그러면 다음과 같은 결과를 얻을 것입니다.

```text
map[CST:-21600 EST:-18000 KST:32400 MST:-25200 PST:-28800 UTC:0]
```

`%v`는 정말 그대로 value를 출력하는 것입니다.

```go
type T struct {
    a int
    b float64
    c string
}
t := &T{ 7, -2.35, "abc\tdef" }
fmt.Printf("%v\n", t)
fmt.Printf("%+v\n", t)
fmt.Printf("%#v\n", t)
fmt.Printf("%#v\n", timeZone)
```

이에 대한 결과는

```text
&{7 -2.35 abc   def}
&{a:7 b:-2.35 c:abc     def}
&main.T{a:7, b:-2.35, c:"abc\tdef"}
map[string]int{"CST":-21600, "EST":-18000, "KST":32400, "MST":-25200, "PST":-28800, "UTC":0}
```

`%+v` 는 데이터의 구조를 그 이름과 함께 출력해주고, `%#v`는 Go의 문법에 맞게 출력해줍니다.

* `string`이나 `[]byte`에 대해서 `%q`를 사용하면 문자열을 escape하여 print할 수 있습니다.

* 어떤 변수의 type을 출력하려면 `%T`를 사용합니다.
* 그 외 수많은 formatting 옵션은 [링크](https://golang.org/pkg/fmt/)를 참고하시면 좋습니다.

<br/>

### Append

Go의 built-in 함수인 `append` 은 우리가 [위에서](###Slices) 작성한 `Append` 함수와 좀 다릅니다.

그 형태는 다음과 같이 작성해볼 수 있습니다. 

```go
func append(slice []T, slements ...T) []T
```

T는 어떤 타입에 대한 placeholder 로 볼 수 있는데, Go에서는 generic을 사용할 수 없기 때문에 built-in으로 제공되는 것입니다. 컴파일러의 도움이 필요한 부분입니다.

```go
x := []int{1,2,3}
y := []int{4,5,6}
// x와 y의 각 데이터의 타입이 맞지 않으면 컴파일 실패
x = append(x, y...)
fmt.Println(x)
```

<br/>