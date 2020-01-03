---
layout: post
title:  "HTML/CSS Basic 2"
date:   2019-03-23 19:00:00 +0700
categories: [html, css]
---
저번에 진행했던 내용에 이어서, 오늘은 미니언즈 소개 홈페이지를 완성해보았습니다.<br/>

주된 내용은 `flex` 를 사용해서 목록들을 배치하는 것이었습니다.<br/>

<br/>

## display : flex;

> flex를 연습하려면 [이 사이트](http://flexboxfroggy.com/#ko) 를 참고하세요.
>
> - **pond** 라는 **id**를 가진 **div**안에 개구리에 해당하는 div(한 개 또는 여러개)가 존재합니다.
>
> - flex 옵션을 수정하여 개구리를 수련잎으로 보내주면 됩니다.

<br/>

<br/>이 옵션은 div 또는 여러가지 태그들의 위치를 쉽게 조절하기 위해 사용합니다.

flex를 쓰지 않고 css를 먹이려면, position, top,right,bottom,left, float 등의 속성을 추가해주면 할 수 있습니다.<br/>

flex의 장점은, 몇 줄 안되는 css 코드로 이쁜 배치를 이루어낼 수 있다는 것입니다.

* 예시(class="boxes" 인 **div** 의 안쪽 태그들에 **flex** 적용시키기)

```css
.boxes{
  display: flex;
  justify-content: space-between;
}
```

![img](/assets/html-css-basic/flex_tutorial.png)

[**소스코드 보기**](https://codepen.io/leesungbin/pen/vPbadg)(입맛대로 코드 수정해보세요!)

<br/>

## Minions 소개 사이트 꾸미기

>  [초기 **HTML & CSS 코드** 보기](https://codepen.io/leesungbin/pen/XGOPOR)

초기 상태에서 시작하여 css를 적용시켜보도록 하겠습니다.

- css를 잘 먹이려면, 어떤 구조를 가지게 사이트를 만들지 구상을 해놓는것이 좋습니다.
- 최종상태

![img](/assets/html-css-basic/res1.png)

![img](/assets/html-css-basic/res2.png)

![img](/assets/html-css-basic/res3.png)

<br/>

<br/>

**1) 배경 색, 및 글자 색**

- index.css

```css
body {
    font-family: 'locus_sangsang';
    background-color: black;
    color: white;
  	margin: 0;
}
```

> body에는 우리가 사용자에게 보여줄 모든 내용들이 담기게 되죠.
>
> 전체 페이지의 **배경색깔**(`background-color`)을 검정색으로, **글씨색**(`color`)은 하얀색으로 설정해주었습니다.
>
> **margin**을 0으로 설정하여 기본적으로 제공되는 body의 여백을 없애줍니다. (-> video가 딱 붙도록!)

<br/>

<br/>

**2) header**

- index.html

```html
<header>
  <ul class="menu">
    <li><a href="#"><img id="logo" src="...로고 주소..." alt=""></a></li>
    
    <div class="menu_select">
      <li><a href="#main">Video</a></li>
      <li><a href="#minions">Minions</a></li>
      <li><a href="#footer">End</a></li>
    </div>
  </ul>   
</header>
```

> header 안에 있는 4개의 list들 중에서, 메뉴 선택에 해당하는 3개의 리스트들은 `.menu_select` 로 묶어주었습니다.
>
> (`.menu_select`로 묶었다는 것은 **class 명**이 menu_select로 주었다는 이야기입니다. 만약에 `#menu_select`로 묶었다고 한다면, **id 명**을 menu_select로 지정했다는 의미입니다.)

<br/>

- index.css

```css
/* (1) */
.menu {
  display: flex;
  flex-direction: column;
  align-items: center;
}
/* (1-1) */
#logo {
  width: 50px;
}
/* (2) */
.menu_select{
  display: flex;
  justify-content: center;
}

/* (3) */
.menu li{
  list-style-type: none;
}

/* (4) */
.menu li a{
  color: white;
  text-decoration: none;
}

/* (5) */
.menu_select li{
  margin-right: 20px;
}

/* (6) */
header{
  position: sticky;
  top: 0;
}
```

> 1. `.menu`는 **로고**와 **메뉴'들'**을 가지고 있습니다. 여기에 flex를 걸어주는데, 이 때 `flex-direction: column;` &  `align-items: center;`옵션을 주어서 페이지의 중앙 부분에 배치해줍니다.
>
> 2. 메뉴들의 부모 태그에 해당하는 `.menu_select`에 `display: flex`를 적용하여, 메뉴들이 가로로 붙어있게 해 줍니다.
>
> 3. `.menu` 내부에 있는 `li`들에는 list 태그 앞에 붙는 점을 없에 줄 수 있도록 합니다.
>
> 4. `.menu` 내부의 `li` 내부의 `a` 태그에는 기본적으로 파란색+밑줄이 그어져있습니다. `color: white`로 글씨 색상을 하얀색으로 유지해주고, `list-style-type: none;`을 통해 밑줄을 제거해줍니다.
>
> 5. `.menu_select` 내부의 `li`들은 `margin-right: 20px;`을 주어 각 메뉴들이 너무 붙어있지 않도록 공간을 줍니다.
> 6. `header`에 해당하는 내용들이, 스크롤을 아래로 내려도 `top:0` 위치에 붙어있도록 해줍니다.

<br/>

<br/>

**3) main**

- index.html

```html
<div id="main">
  <!-- (7) --> 
  <video width="100%" src="superbad_minions.mp4" autoplay muted loop></video>
  
  <!-- (10) -->
  <div class="container">
    
    <!-- (8) -->
    <div class="minions">
      <img class="minion" src="~~케빈 주소~~" alt="">
      <img class="minion" src="~~스튜어트 주소~~" alt="">
      <img class="minion" src="~~밥 주소~~" alt="">
    </div>

    <!-- (9) -->
    <p class="info">Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab natus consequuntur at, odit dolorem officiis ex modi odio soluta ducimus aliquam adipisci molestiae magni similique, repellat atque cum repellendus mollitia!
      ...</p>
  </div>
</div>
```

> (7) **video** 태그에 `width="100%"` 속성을 추가해 주었습니다. `"` 를 빼면 동작하지 않습니다.ㅜ
>
> > video의 src가 제대로 작성되어있는지 확인해줍니다.
>
> (8) minion 사진들을 `.minions`로 묶어주었습니다. 여기에 flex옵션을 적용할 것 입니다.
>
> (9) **p** tag에 `.info`를 주었습니다.
>
> (10) `.minions`와 `.info`는 페이지의 양 옆에 적당한 간격을 두도록 할 것이어서 `.container`로 묶었습니다.

<br/>

* index.css

```css
/* (11) */
#minions_video{
    min-width: 1200px;
}

/* (12) */
.container {
  margin-left: 10%;
  margin-right: 10%;
}

/* (13) */
.minion{
  width: 300px;
  height: 300px;
  border-radius: 150px;
}

/* (14) */
.minions{
  display: flex;
  justify-content: space-around;
}

/* (15) */
.info{
  margin-top: 100px;
}
```

> (11) **video**가 줄어들 수 있는 크기에 1200px로 제한을 두었습니다.
>
> (12) `.container`는 좌,우로 전체 페이지의 10%에 해당하는 여백을 갖습니다.
>
> (13) 각 미니언들의 가로, 세로 크기는 300px로 주고, 경계의 반지름을 150px로 하여, 원 형태의 사진으로 만들어줍니다.
>
> (14) `.minions` 내부의 미니언 사진들에 flex 옵션을 주고, 서로 일정한 간격을 두게 하였습니다.
>
> (15) **p** 태그가 그림과 너무 붙어있어서 `margin-top: 100px;` 옵션을 주었습니다.

<br/>

<br/>

**4) footer**

- index.css

```css
/* (16) */
#footer{
  background-color: #FCDC6D;
  height: 150px;
  font-size: 50px;
  text-align: center;
  padding-top: 15px;
  color: black;
}

/* (17) */
#footer p a{
  text-decoration: none;
  color: black;
}
```

> (16) `#footer`의 배경색은 미니언의 몸 색깔과 비슷하게 해줍니다! ([colorzilla](http://www.colorzilla.com/chrome/)), div의 높이와 폰트 크기를 정해주고, `text-align: center;`로 글씨를 가운데 정렬 해줍니다.
>
> > [margin vs padding](https://coding-factory.tistory.com/187) 참고
>
> (17) `#footer` 내부의 **p** 태그 내부의 **a** 태그는, header에서 a 태그를 다뤘던 것 처럼, `text-decoration: none;` 그리고 여기서는 `color: black;`을 주었습니다.

<br/>

<br/>

> css에서는 **나중에 쓴 코드**가 반영됩니다. 그래서 **body**에 `color: white;`를 주었어도, 그 밑 부분에 작성된 `#footer`에서 `color: black;`을 주었을 때, 제대로 작동했던 것 입니다!

<br/>

<br/>

**미니언즈 소개 홈페이지 작성 끝!**

[**완성 된 코드 보기**](https://codepen.io/leesungbin/pen/LaqgLX)

<br/>

<br/>