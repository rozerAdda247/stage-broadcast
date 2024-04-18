# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

Install all dependenices

### `npm install || npm install --legacy-peer-deps`

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)



The Required APIs Call:-

curl --location 'https://newadminui-k8s.adda247.com/api/v1/app/ivs/stages/createParticipantToken' \
--header 'authority: newadminui-k8s.adda247.com' \
--header 'accept: application/json, text/plain, */*' \
--header 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
--header 'and_app_version: 375' \
--header 'content-type: application/json' \
--header 'origin: http://localhost:2048' \
--header 'referer: http://localhost:2048/' \
--header 'sec-ch-ua: "Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"' \
--header 'sec-ch-ua-mobile: ?0' \
--header 'sec-ch-ua-platform: "macOS"' \
--header 'sec-fetch-dest: empty' \
--header 'sec-fetch-mode: cors' \
--header 'sec-fetch-site: cross-site' \
--header 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' \
--header 'x-liveclass-authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3N1ZXIiOiJBZGRhMjQ3IiwidXNlcm5hbWUiOiJhZGRhMjQ3YWRtaW4iLCJyb2xlIjoidXNlciIsInVuaXF1ZWtleSI6ImFkZGEyNDctaXZzLWF1dGgta2V5IiwiaWF0IjoxNjY4MTU0NzU0fQ.0px0EEmDAsL16pToQ6chuQ8v3HXuy30ogLOcTQozvL4' \
--data '{
    "stageArn": "arn:aws:ivs:us-east-1:748804974185:stage/w1OlGzTgX19m",
    "attributes": {
        "username": "Rozer Student-2",
        "userId": "4721",
        "role": "STUDENT",
        "sheduledid": "348369",
        "topicName": "",
        "isScreenshare": "false",
        "avatar": "",
        "liveLatency": "",
        "timestamp": 1713429069,
        "teacher_screenshare": "false",
        "teacher_video": "false"
    },
    "capabilities": [
        "PUBLISH",
        "SUBSCRIBE"
    ],
    "duration": 2400,
    "userId": "4721",
    "role": "STUDENT",
    "userInfo": {
        "username": "Rozer Student-2",
        "userId": "4721",
        "role": "STUDENT",
        "sheduledid": "348369",
        "topicName": "English"
    }
}



curl --location 'https://stagingapi.adda247.com/lc-common-ws/api/v1/app/ivs/stage/participant/listing?stageArn=arn%3Aaws%3Aivs%3Aus-east-1%3A748804974185%3Astage%2FXykdEM4lU17m' \
--header 'Content-Type: application/json' \
--data '{
    "stageArn":"arn:aws:ivs:us-east-1:748804974185:stage/XykdEM4lU17m"
}'