---
layout: post
title: "어떻게 해야 Go를 잘 쓸까 고민(Effective Go) 2"
date: 2020-02-02 21:50:00 +0700
categories: [golang, effectivego]
published: true
---

> Effective Go 문서를 읽어보면서, Golang에 대한 이해를 높이고 좋은 코드를 작성하는 것이 목표입니다.
>
> (Control Structures, Functions)

<br/>

## Control structures

제어문의 경우 C와 비슷하지만 다른 점이 몇가지 있습니다.

* `do`, `while` loop가 없고, `for`문으로 반복문을 대체합니다.
* `switch`문이 더 유연하게 사용됩니다.
* `if`와 `switch` 문에서는 `for`문에서 초기값 설정하듯 변수 선언을 할 수 있습니다.
* `break`와 `continue`문은 무엇을 break, continue할지 정의할 수 있습니다.
* `select`문으로 여러 상황(condition)에 대한 대처를 할 수 있습니다.
* 괄호를 사용하지 않습니다.

### If

```go
// (1)
if x > 0 {
  return y
}

// (2)
if err := file.Chmod(0664); err != nil {
  log.print(err)
  return err
}

// (3)
f, err := os.Open(name)
if err != nil {
  return err
}
codeUsing(f)
```

(1) go에서 if문을 사용하는 일반적인 형태입니다.

(2) 초기값 선언을 할 수 있습니다. 이는 Go에서 자주 사용되는 방식입니다. err는 if문 안에서의 지역변수로 사용될 수 있습니다.

(3) break, continue, goto, return 등으로 마무리 되어, else를 사용하지 않아도 될 경우, 불필요한 `else`는 생략합니다.

```go
f, err := os.Open(name)
if err != nil {
  return err
}
d, err := f.Stat()
if err != nil {
  f.Close()
  return err
}
codeUsing(f, d)
```

위의 코드를 읽어보면, err가 존재할 경우, err를 return하고 작업이 성공적으로 진행됐을 때, `f`와 `d`를 사용하는 코드를 작성하게 된다는 흐름을 볼 수 있습니다. 여기서 불필요한 `else`문은 작성하지 않은 것도 확인할 수 있습니다.

<br/>

### Redeclaration and reassignment

위의 예시에서 `:=` 문으로 변수 선언을 간략하게 하였습니다.

```go
f, err := Os.Open(name)
// ...
d, err := f.Stat()
// ...
```

또한 err 변수가 두번 새로 선언되었다고 볼 수 있는데, 이는 괜찮은 방법입니다. 두번째 선언에서는 그저 재할당(reassignment) 되었을 뿐입니다. 즉, 두번째 err가 선언될 때는, 기존에 존재한 err 변수에 새로운 값을 할당시켜준 겁니다.

이러한 방식은 긴 `if-else` 문이 있을 경우 자주 사용되는 것을 볼 수 있습니다.

<br/>

### For

```go
// C에서의 for문 역할
for init; condition; post { }

// C에서의 while 역할
for condition {}

// C에서 for(;;) - 무한루프
for {}
```

<br/>

Array, slice, string, map, channel로부터 값을 읽는 등의 경우, `range` 절을 사용하여 반복문을 사용할 수 있습니다.

```go
for key, value := range oldMap {
  newMap[key] = value
}

// 첫번째 값만 필요한 경우, 두번째 값은 버린다.
for key := range m {
  if key.expired() {
    delete(m, key)
  }
}

// 두번째 인자만 필요한 경우,
// blank identifier( _ )를 사용하여 첫번째 값을 버린다.
sum := 0
for _, value := range arr {
  sum += value
}
```

<br/>

문자열의 경우, `range`가 UTF-8로 인코딩 된 것을 각각의 유니코드 부분으로 파싱해줍니다. 이상한 encoding이 되어있는 부분은 1 byte의 크기로 파싱됩니다.

```go
for pos, char := range "한국\x80어" {
  fmt.Printf("character %#U starts at byte position %d\n",char, pos)
}
```

그래서 위와 같은 코드를 실행시켜보면

```text
character U+D55C '한' starts at byte position 0
character U+AD6D '국' starts at byte position 3
character U+FFFD '�' starts at byte position 6
character U+C5B4 '어' starts at byte position 7
```

위와 같은 결과를 얻게 됩니다.

Go에는 Comma Operator(쉼표연산자)가 없습니다. 또한, ++, --는 statement 입니다. expression이 아닙니다.

```go
// a 배열을 뒤집기
for i,j := 0, len(a)-1 ; i < j; i, j = i+1, j-1 {
  a[i], a[j] = a[j], a[i]
}
```

위의 경우, 문법상  `i++, j-- ` 같이 사용할 수 없어, 위와 같이 사용합니다.

<br/>

### Switch

Go의 `switch` 는 C에서보다 좀 더 일반적으로 사용됩니다. expression은 상수, 정수일 필요가 없고, 위에서 아래 방향으로 매칭될 때까지 진행됩니다. switch expression에 아무것도 없으면 true로 판단하고 진행합니다. 그래서 if-else-if-else 같은 구조를 switch로 표현할 수 있습니다.

```go
func unhex(c byte) byte {
  switch {
  case '0' <= c && c < '9':
    return c - '0'
  case 'a' <= c && c <= 'f':
    return c - 'a' + 10
  case 'A' <= c && c <= 'F':
  	return c - 'A' + 10  
  }
  return 0
}

// case는 comma로 분리된 list형태로 주어질 수도 있습니다.
func shouldExcape(c byte) bool {
  switch c {
  case ' ', '?', '&', '=', '#', '+', '%':
  	return true  	
  }
  return false
}
```

C와 달리 go에서는 switch에서 break를 잘 사용하지 않지만, break를 사용함으로써 case를 일찍 마무리 할 수 있습니다. 또한 어떤 loop에 라벨을 부여할 수 있고, break로 라벨에 해당하는 loop를 빠져나갈 수 있습니다.

```go
Loop:
	for n := 0; n < len(src); n += size {
		switch {
		case src[n] < sizeOne:
			if validateOnly {
				break
			}
			size = 1
			update(src[n])
		case src[n] < sizeTwo:
			if n+1 >= len(src) {
				err = errShortInput
				break Loop
			}
			if validateOnly {
				break
			}
			size = 2
			update(src[n] + src[n+1]<<shift)
		}
	}
```

continue문 또한 loop에 한해서 label을 지정할 수 있습니다.

<br/>

### Type switch

switch문은 interface 변수의 동적인 타입을 발견하는데 사용될 수도 있습니다.

```go
var t interface{}
t = functionOfSomeType()
switch t := t.(type) { // 동일한 이름으로 생성하는 것이 관용적입니다.
default:
  fmt.Printf("unexpected type %T\n", t)
case bool:
  fmt.Printf("boolena %t\n", t)
case int:
  fmt.Printf("integer %d\n", t)
case *bool:
  fmt.Printf("pointer to boolean %t\n", *t)
case *int:
  fmt.Printf("pointer to integer %d\n", *t)  
}
```

<br/>

## Functions

### Multiple return values

Go의 특징 중 하나는 함수 or 메소드가 여러개의 값을 return할 수 있다는 것입니다. C에서는 write error가 발생했을 때, negative count가 신호가 되어 error 상태를 볼 수 있습니다. Go에서는 이를 다음과 같이 처리합니다.

```go
func (file *File) Write(b []byte) (n int, err error)
```

그래서, 정상적으로 작동할 경우, 몇 바이트를 썼는지가 n에 담길 것이고, `n != len(b)` 일 경우, err에는 non-nil 값이 들어가게 되겠지요. 이런식으로 함수를 작성하는 것이 일반적입니다.

<br/>

### Named result parameters

즉, return 될 값을 미리 초기화 시킬 수 있는 것입니다.

```go
func calculate(a, b int) (res int, err error) {
  err = nil
  if a < 1 {
    res = a + b
    return
  }
  return
}
```

이상한 예 입니다만, 만약 a에 2 값이 전달된다면, if 문 내부가 실행되지 않으므로, res는 int 변수를 선언시 초기값인 0으로 return될 것입니다.

<br/>

### Defer

Go의 defer문은 어떤 함수가 종료되기 전에 실행될 것을 예약하는 것과 같습니다.

```go
func Contents(filename string) (string, error) {
  f, err := os.Open(filename)
  if err != nil {
    return "", err
  }
  defer f.Close() // 모든 작업이 완료된 후, 실행할 것 (1)
  
  var result []byte
  buf := make([]byte, 100)
  for {
    n, err := f.Read(buf[0:])
    result = append(result, buf[0:n])
    if err != nil {
      if err == io.EOF {
        break
      }
      return "", err // 여기서 return시 f.Close() 실행
    }
  }
  return string(result), nil // 여기서 return시 f.Close() 실행
}
```

(1)  과 같이 defer을 사용하면 좋은 점은, 우선 close 할 것을 잊는 실수를 줄일 수 있다는 것과, open과 close를 가까이에 놓음으로써 함수의 마지막 부분에 close를 놓는 것 보다 흐름이 명확하게 잘 보인다는 것입니다.

defer는 스택의 형태로 쌓일 수 있습니다. 만약 다음과 같은 코드가 있다면,

```go
for i := 0; i < 5; i++ {
  defer fmt.Printf("%d ", i)
}
```

4 3 2 1 0 의 결과를 얻게 됩니다.

다음과 같은 예를 살펴보겠습니다.

```go
func trace(s string) string {
  fmt.Println("entering:", s) // (2), (5)
  return s
}

func un(s string) {
  fmt.Println("leaving:", s) // (7), (8)
}

func a() {
  defer un(trace("a")) // trace("a") : (5), un("a") : (7)
  fmt.Println("in a") // (6)
}

func b() {
  defer un(trace("b")) // trace("b") : (2), un("b") : (8)
  fmt.Println("in b") // (3)
  a() // (4)
}

func main() {
  b() // (1)
}
```

출력되는 순서는 다음과 같게 됩니다.

```text
entering: b
in b
entering: a
in a
leaving a
leaving b
```

<br/>

<br/>

## References

* https://golang.org/doc/effective_go.html