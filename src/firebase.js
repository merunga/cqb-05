// importar modulos de firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js';
import {
  getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile, signOut, sendEmailVerification, signInWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';
import {
  getFirestore, collection, addDoc, getDoc, getDocs, orderBy, Timestamp, deleteDoc, updateDoc, query, doc, increment, arrayUnion, arrayRemove,
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyC8vBCCnI6bXjAa3ZOAVJd5rFv1Doeg3c8',
  authDomain: 'red-social-ninverse.firebaseapp.com',
  projectId: 'red-social-ninverse',
  storageBucket: 'red-social-ninverse.appspot.com',
  messagingSenderId: '985322603240',
  appId: '1:985322603240:web:2334b8f836fa9a2e5c3f5d',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// firestore
const db = getFirestore(app);

// auth para cualquier correo electrónico y para Google.
const auth = getAuth();
const provider = new GoogleAuthProvider();

// registrarse con correo electronico
function newUser() {
  const botonSubmit = document.getElementById('submitBtn');
  botonSubmit.addEventListener('click', (event) => {
    event.preventDefault();
    const mailInput = document.getElementById('mailInput').value;
    const passInput = document.getElementById('passInput').value;
    const nickInput = document.getElementById('nickInput').value;
    const bioInput = document.getElementById('bioInput').value;
    const birthInput = document.getElementById('birthInput').value;
    const chosenPic = document.getElementsByTagName('img')[0].getAttribute('src');
    // let chosenPic = document.getElementById('profilePic').src

    // iterar a traves de las opciones y rescatar las marcadas.
    let gender = document.querySelectorAll('.checkInput');
    const arrayGender = [];
    gender.forEach((e) => {
      if (e.checked == true) {
        gender = e.value;
        arrayGender.push(gender);
      }
    });

    createUserWithEmailAndPassword(auth, mailInput, passInput)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        const userId = user.uid;
        newUserData(userId, nickInput, bioInput, birthInput, chosenPic, arrayGender);
        uploadBytes(chosenPic);
        updateProfile(auth.currentUser, { displayName: nickInput }).then(() => {
          console.log('perfil creado');
        }).catch((error) => {
          console.log(error.message);
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        console.log(errorCode);
        const errorMessage = error.message;
        console.log(errorMessage);

        // alerts según error
        switch (errorCode) {
          case 'auth/email-already-in-use':
            alert('Este correo ya está en uso');
            break;
          case 'auth/missing-email':
            alert('Por favor completar su correo');
            break;
          case 'auth/invalid-email':
            alert('Correo inválido');
            break;
          case 'auth/weak-password':
            alert('Su contraseña debe tener al menos 6 caracteres alfanuméricos');
            break;
          case 'auth/internal-error':
            alert('No sabemos, tamos xikitas');
            break;
        }
      });
    event.stopImmediatePropagation();
  });
}

// registrar usuarios con cuenta google
function newGoogleUser() {
  const googleBtn = document.getElementById('google');
  googleBtn.addEventListener('click', (event) => {
    event.preventDefault();
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        const userId = user.uid;
        googleUsers().then((data) => { window.location.assign('/welcome'); });
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        console.log(error.message);
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  });
}

// insertar en la base de datos y que se envie correo de verificacion, y que posteriormente se cargue la vista de bienvenida.
function newUserData(userId, nickInput, bioInput, birthInput, chosenPic, arrayGender) {
  const userData = collection(db, 'UsersList');
  const docUserData = addDoc(userData, {
    id: userId,
    Name: nickInput,
    Description: bioInput,
    Age: birthInput,
    Gender: arrayGender,
    Picture: chosenPic,
  })
    .then(() => {
      console.log('data registrada con éxito');
      sendEmailVerification(auth.currentUser);
      window.location.assign('/welcome');
    })
    .catch((error) => {
      const errorCode = error.code;
      console.log(errorCode);
      const errorMessage = error.message;
      console.log(errorMessage);
    });
}

// login con cualquier correo
function logIn() {
  const loginBtn = document.querySelector('.nextBtn');
  loginBtn.addEventListener('click', (event) => {
    event.preventDefault();
    const mailInput = document.getElementById('mailInput').value;
    const passInput = document.getElementById('passInput').value;
    signInWithEmailAndPassword(auth, mailInput, passInput)
      .then((userCredential) => {
        window.location.assign('/dash');

        // Signed in
        const user = userCredential.user;
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(error.code);
        console.log(error.message);
        switch (errorCode) {
          case 'auth/wrong-password':
            alert('La contraseña es incorrecta');
            break;
          case 'auth/user-not-found':
            alert('El usuario no ha sido encontrado');
            break;
          case 'auth/invalid-email':
            alert('El correo no es válido');
            break;
          case 'auth/internal-error':
            alert('Ingrese la contraseña');
            break;
        }
      });
    event.stopImmediatePropagation();
  });
}

// insertar usuarios de google en la base de datos
const googleUsers = async () => {
  const user = auth.currentUser;
  if (user !== null) {
    const docRef = await addDoc(collection(db, 'UsersList'), {
      id: user.uid,
      name: user.displayName,
      picture: user.photoURL,
    });
  }
};

// login con google
function logInGoogle() {
  const googleBtn = document.getElementById('googleLogin');
  googleBtn.addEventListener('click', (event) => {
    event.preventDefault();
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        const userId = user.uid;
        window.location.assign('/dash');
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        console.log(error.message);
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  });
}

// hacer posts
function postData() {
  document.getElementById('publishPost').addEventListener('click', postUser);
  event.preventDefault();
  function postUser() {
    const post = document.getElementById('inputPost').value;
    if (post.length === 0) {
      alert('No hay nada que publicar!!');
    } else {
      addDoc(collection(db, 'Post'), {
        uid: auth.currentUser.uid,
        name: auth.currentUser.displayName,
        picture: auth.currentUser.photoURL,
        description: post,
        likes: [],
        likesCounter: 0,
        datepost: Timestamp.fromDate(new Date()),
      });
      document.getElementById('inputPost').value = '';
    } event.stopImmediatePropagation();
  }
}

// funcion para recuperar los posts de la base de datos (se activa al hacer click (?))
async function postDash() {
  const allPostsData = [];
  const allPosts = query(collection(db, 'Post'), orderBy('datepost', 'desc'));
  const querySnapshot = await getDocs(allPosts);
  querySnapshot.forEach((doc) => {
    allPostsData.push({ ...doc.data(), id: doc.id });
    console.log(doc.id);
  });
  console.log(allPostsData);
  // eliminar post
  return allPostsData;
}

// dar likes y quitar likes
async function likes(id, user) {
  const postRef = doc(db, 'Post', id);
  const docsData = await getDoc(postRef);
  const allData = docsData.data();
  if (allData.likes.includes(user)) {
    await updateDoc(postRef, {
      likes: arrayRemove(user),
      likesCounter: increment(-1),
    });
  } else {
    await updateDoc(postRef, {
      likes: arrayUnion(user),
      likesCounter: increment(1),
    });
  }
}

// funcion borrar
function deletePost(id) {
  deleteDoc(doc(db, 'Post', id));
}

// funcion editar
async function editPosts(id, input) {
  const postEdit = doc(db, 'Post', id);
  await updateDoc(postEdit, {
    description: input,
  });
}

// cerrar sesion
function logOut() {
  document.getElementById('logOutButton').addEventListener('click', () => {
    signOut(auth).then(() => {
      // Sign-out successful.
      window.location.assign('/');
    }).catch((error) => {
      console.log(error.message);
    });
  });
}

export {
  newUser, newGoogleUser, logIn, logInGoogle, auth, postData, postDash, logOut, createUserWithEmailAndPassword, deletePost, likes, editPosts,
};

