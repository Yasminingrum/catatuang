import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import app from "./config";

export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const registerUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCredential.user, {
    url: window.location.origin + "/",
  });
  return userCredential;
};

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export const resendVerificationEmail = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  if (!userCredential.user.emailVerified) {
    await sendEmailVerification(userCredential.user, {
      url: window.location.origin + "/",
    });
  }
};

export const forgotPassword = (email) => {
  return sendPasswordResetEmail(auth, email, {
    url: window.location.origin + "/",
  });
};

export const logoutUser = () => signOut(auth);

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};