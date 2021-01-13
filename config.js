import * as firebase from 'firebase'
require('@firebase/firestore')


var firebaseConfig = {
    apiKey: "AIzaSyDsTRSguaQnja6DfuCGJWsOvIXJRKPT1CM",
    authDomain: "wily-app-c3d3b.firebaseapp.com",
    projectId: "wily-app-c3d3b",
    storageBucket: "wily-app-c3d3b.appspot.com",
    messagingSenderId: "531220671114",
    appId: "1:531220671114:web:6ff06c99e2d883c3e7db73"
};

firebase.initializeApp(firebaseConfig);

export default firebase.firestore();