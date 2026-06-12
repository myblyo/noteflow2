import auth, { type FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

const USERS = "users";

function mapAuthUser(
  user: FirebaseAuthTypes.User,
  name?: string,
  avatarUrl: string | null = null,
): UserProfile {
  return {
    id: user.uid,
    email: user.email ?? "",
    name: name ?? user.displayName ?? "",
    avatarUrl,
  };
}

export function firebaseAuthErrorMessage(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code: string }).code)
      : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "El email ya está registrado";
    case "auth/invalid-email":
      return "Email no válido";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Credenciales incorrectas";
    case "auth/too-many-requests":
      return "Demasiados intentos. Prueba más tarde";
    default:
      return error instanceof Error ? error.message : "Error de autenticación";
  }
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const doc = await firestore().collection(USERS).doc(uid).get();
  if (!doc.exists) return null;

  const data = doc.data();
  return {
    id: uid,
    email: data?.email ?? "",
    name: data?.name ?? "",
    avatarUrl: data?.avatarUrl ?? null,
  };
}

export async function registerWithProfile(
  email: string,
  password: string,
  name: string,
): Promise<UserProfile> {
  const userCredential = await auth().createUserWithEmailAndPassword(
    email,
    password,
  );
  const userId = userCredential.user.uid;

  try {
    await firestore().collection(USERS).doc(userId).set({
      name,
      email,
      createdAt: firestore.FieldValue.serverTimestamp(),
      avatarUrl: null,
    });
    await userCredential.user.updateProfile({ displayName: name });
  } catch (error) {
    await userCredential.user.delete();
    throw error;
  }

  return mapAuthUser(userCredential.user, name, null);
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<UserProfile> {
  const credential = await auth().signInWithEmailAndPassword(email, password);
  const profile = await fetchUserProfile(credential.user.uid);
  return profile ?? mapAuthUser(credential.user);
}

export async function logoutFirebase(): Promise<void> {
  await auth().signOut();
}

export async function updateUserAvatarUrl(
  uid: string,
  avatarUrl: string,
): Promise<void> {
  await firestore().collection(USERS).doc(uid).update({ avatarUrl });
}

export function mapFirebaseUser(user: FirebaseAuthTypes.User): UserProfile {
  return mapAuthUser(user);
}
