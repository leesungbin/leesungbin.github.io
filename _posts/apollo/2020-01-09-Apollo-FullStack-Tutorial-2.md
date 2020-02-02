---
layout: post
title: "Apollo로 풀스택하기 2"
date: 2020-01-09 20:29:00 +0700
categories: [apollo, graphql, nodejs, react, typescript, sqlite3]
---

> 이전 글에 이어서, apollo 서버 개발을 계속 진행합니다.
>
> Space-X의 data를 가져오는 방법에 대하여 알아봅니다.

<br/>

# 4. REST에서 Graph로 (`Apollo Datasource`)

Space-X API는 REST(REpresentational State Transfer) 서비스를 제공합니다.

 `apollo-datasource-rest` 라이브러리는 REST API로 제공받는 데이터를 GraphQL 에서 사용할 수 있도록, graph 형태로 변경시켜줍니다.

다음 라이브러리를 설치합니다.

```bash
npm i --save apollo-datasource-rest
```

이 패키지의 `RESTDataSource` 클래스가 REST API에 요청을 보내고 받는 것을 담당합니다.

`this.baseURL` 에 `https://api.spacexdata.com/v2/`(SpaceX API 주소)를 전달해주겠습니다.

<br/>

```typescript
// src/datasources/launch.ts
import { RESTDataSource } from 'apollo-datasource-rest';

export class LaunchAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.spacexdata.com/v2';
  }
}
```

이것이 LaunchAPI의 기초 틀이 됩니다.

우리는 LaunchAPI클래스 내부에, API에 접근해서 데이터를 가져올 수 있는 함수를 작성해주어야합니다.

```typescript
// src/datasources/launch.ts

export class LaunchAPI extends RESTDataSource {
// ...
  getAllLaunches = async () => {
    const response = await this.get('launches');
    return Array.isArray(response)
      ? response.map(launch => this.launchReducer(launch))
      : [];
  }
}
```

getAllLaunches 함수는 {{ baseURL }}/launches 주소로 접근했을 때, 그 결과를 parsing하는 역할을 담당합니다.

https://api.spacexdata.com/v2/launches 이 주소로 들어가보면, response에 어떤 형태의 데이터가 들어올지 확인해 볼 수 있습니다.

그래서 우리는 필요한 정보들만 가져올 수 있도록, `response` 의 각 요소를 하나씩 launchReducer로 mapping 해주면 됩니다. (이전에 작성한 schema를 참고하면서)

<br/>

launchReducer 함수를 작성해봅니다.

```typescript
// src/datasources/launch.ts

export class LaunchAPI extends RESTDataSource {
// ...
  launchReducer = (launch: any) => {
    return {
      id: launch.flight_number || 0,
      cursor: `${launch.launch_date_unix}`,
      site: launch.launch_site && launch.launch_site.site_name,
      mission: {
        name: launch.mission_name,
        missionPatchSmall: launch.links.mission_patch_small,
        missionPatchLarge: launch.links.mission_patch,
      },
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type,
      },
    };
  }
}
```

이제 SpaceX의 어떤 데이터에 대하여든, 우리가 필요한 값들만 가져올 수 있게 되었습니다.

<br/>

우리가 처음 작성한 schema를 보면, launch를 쿼리할 때, 'id로 필터를 걸 수 있게 할 것이다' 를 볼 수 있습니다.

이를 위해 `getLaunchById` 함수를 작성합니다.

```typescript
// src/datasources/launch.ts

export class LaunchAPI extends RESTDataSource {
// ...
  getLaunchById = async ({ launchId }: { launchId: number }) => {
    const response = await this.get('launches', { flight_number: launchId });
    return this.launchReducer(response[0])
  }
}
```

위를 이용하여, 여러개의 id가 주어졌을 경우에 `Launches`를 가져올 수 있도록 `getLaunchesByIds` 함수를 작성합니다.

```typescript
// src/datasources/launch.ts
export class LaunchAPI extends RESTDataSource {
// ...
  getLaunchesByIds = ({ launchIds }: { launchIds: number[] }) => {
    return Promise.all(
      launchIds.map(launchId => this.getLaunchById({ launchId }))
    );
  }
}
```

여기까지 진행했다면, 성공적으로 REST API를 Apollo에서 사용하는 Graph 형태로 변경시킬 수 있게 된 것입니다.

<br/>

현재까지 우리가 작성한 것은 읽을 수 밖에 없는 형태입니다.

사용자 및 사용자에 대한 여행 관련 데이터가 담길 수 있는 데이터베이스가 필요합니다.

다음 글에서 데이터베이스 설정과 관련하여 알아보도록 하겠습니다.