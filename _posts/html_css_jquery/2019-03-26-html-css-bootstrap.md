---
layout: post
title:  "HTML/CSS Bootstrap"
date:   2019-03-26 19:00:00 +0700
categories: [html, css]
---

![img](/assets/html-css-bootstrap/bootstrap_main.png)

>  Bootstrap은 우리가 지금까지 공부해온 html, css와 다른게 없습니다. <br/>그저 누군가가 우릴 위해 `컴포넌트`들과 `스타일`들을 잘 마련해놓은것에 감사하면서, 그것을 사용하는 방법을 알면 됩니다.

<br/>

### 내용 ###

1. 부트스트랩 설정
2. 컴포넌트 & Utilities 소개
3. 코드 작성
4. CSS 추가 자료(linear gradient, mouse effect) - 수업 때 진행 x

<br/><br/>

## 1. 부트스트랩 설정

>  index.css를 index.html과 연결하기 위해 `link` tag를 사용했던 것과 유사합니다.

부트스트랩을 사용하기 위해서는 스타일 파일들을 html 문서로 갖고와야합니다.

 Bootstrap 메인화면 - Get started - CSS, JS 코드를 복사,붙여넣기<br>

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>

    <!-- bootstrap imports own css -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
</head>
<body>
    
    <!-- bootstrap imports js scripts(jQuery, Popper.js) -->
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
</body>
</html>
```

<br/>

> css `link` tag는 `head`에 넣어주는 것이 맞고, js `script`코드는 `head`, `body` 둘 다 넣어도 됩니다.
>
> > 이 때 script 들은 `</body>` 위쪽에다가 넣어주는 것이 좋습니다. [[참고]](https://www.w3schools.com/js/js_whereto.asp)<br/>script를 head에 넣으면 브라우저에서 스크립트 컴파일을 먼저 실행하므로, 이 처리속도가 느려지면 우리가 보여줘야할 내용(body)을 불러오는 시간이 길어집니다.

<br/>

<br/>

## 2. 컴포넌트 & Utilities 소개

1. **Documentation** - **Components** 에는 정말 많은 컴포넌트들이 있습니다. 제가 자주 사용하는 것들만 소개를 하도록 하겠습니다.

   (1) Button

   > class명 : "btn btn-{category}"
   >
   > {category} : primary, secondary, success, danger, warning, info, light, dark, link
   >
   > Ex) `<div class="btn btn-secondary">Test</div>`
   >
   > div -> button 또는 a 태그로 대체 가능

   <br>

   (2) Carousel

   여러개의 사진들을 자연스럽게 넘어가게 하는 디자인을 할 때 유용하게 사용 가능합니다.

   slides only, with controls, with indicators, with captions, crossfade 등 다양한 디자인을 응용하여 사용할 수 있습니다.

   `.carousel-inner` 안에 들어가는 내용들이 carousel에 들어가는 목록이 됩니다.

   `.active` 붙은 것이 사용자에게 보여지는 화면입니다. Javascript를 통해 `.active` 클래스가 붙는 대상이 변경됩니다.

   [Documentation](https://getbootstrap.com/docs/4.3/components/carousel/)

   <br/>

   (3) Modal

   주변은 어두워지고, 특정 부분에 집중하기 위해 사용할 수 있습니다.

   ```html
   <!-- Button trigger modal -->
   <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
     Launch demo modal
   </button>
   
   <!-- Modal -->
   <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
     <div class="modal-dialog" role="document">
       
       <!-- Modal 에 들어가는 내용들입니다! -->
       <div class="modal-content">
         
         <div class="modal-header">
           <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
           <button type="button" class="close" data-dismiss="modal" aria-label="Close">
             <span aria-hidden="true">&times;</span>
           </button>
         </div>
         
         <div class="modal-body">
           ...
         </div>
         
         <div class="modal-footer">
           <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
           <button type="button" class="btn btn-primary">Save changes</button>
         </div>
         
       </div>
       <!-- 여기까지 -->
       
     </div>
   </div>
   ```

   `<!-- button trigger modal-->` 하위 부분과 `<!-- Modal -->` 하위 부분은 각각 모달을 작동시키는 버튼과, 모달에 들어가는 내용입니다.

   버튼 태그에 1) `data-toggle='modal' ` 과 2) `data-target='#exampleModal'` 이 적혀있는 것을 볼 수 있습니다.

   각각의 의미는 <br/>1) 모달을 다루겠다.<br/>2) id가 exampleModal 인 div를 다룬다.

   입니다.<br/>

   그래서 `#exampleModal` 에 해당하는 내용이 버튼이 클릭되었을 때 등장하게 되는 구조로 코드가 짜여있습니다.

   `#exampleModal` 은 목적에 맞게 내용을 수정해주면 됩니다.

   [Documentation](https://getbootstrap.com/docs/4.3/components/modal)

   <br/>

   (4) Navbar

   상단에 Navigation Bar를 구성할 때 편리하게 사용할 수 있습니다.

   Nav 코드는

   ```html
   <nav class="navbar navbar-expand-lg navbar-light bg-light">
   ```

   로 시작합니다. 여기에 있는 `navbar-light` `bg-light` 를 각각 `navbar-dark` `bg-dark` 로 바꿔서 어두운 테마를 적용할 수 있습니다.<br/>

   navbar의 내용은 `ul` 내부의 `li` 로 추가할 수 있으며, `ul`과 같은 위치에 다른 태그를 추가할 수 있습니다.

   [Documentation](https://getbootstrap.com/docs/4.3/components/navbar)

   <br/>

   (5) Forms

   input 이나 textarea 태그를 사용하여 사용자의 입력을 다룹니다.

   * 부트스트랩 태그를 적용하고 싶은 input이나 textarea는 클래스명으로  `form-control`을 넣어주면 됩니다.

   [Documentation](https://getbootstrap.com/docs/4.3/components/forms)

   <br/>

2. **Documentation** - **Utilities** 에는 유용한 스타일들을 만나볼 수 있습니다.

   (1) Colors

   (2) Display

   (3) Flex

   (4) Float

   (5) Position

   (6) Vertical Align

   (7) Spacing

<br/>

[예제 코드 보기](https://codepen.io/leesungbin/pen/wZBWON)

![img](/assets/html-css-bootstrap/bootstrap_example.png)

각각이 어떤 역할을 하는지만 알아도, 어떤 식으로 디자인을 해야할지 대략적인 감을 잡기 편합니다.

