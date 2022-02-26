import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import * as BusBoy from "busboy";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";

import { db, admin } from "../utils/admin";
import { config } from "../utils/config";
import { validateLoginData, validateSignUpData } from "../utils/validators";

const app = initializeApp(config);
const auth = getAuth(app);

// Login
export const loginUser = (request: any, response: any) => {
  const user = {
    email: request.body.email,
    password: request.body.password,
  };

  const { valid, errors } = validateLoginData(user);
  if (!valid) return response.status(400).json(errors);
  signInWithEmailAndPassword(auth, user.email, user.password)
    .then((data) => {
      return response.json({ token: data.user.getIdToken() });
    })
    .catch((error) => {
      console.error(error);
      return response
        .status(403)
        .json({ general: "wrong credentials, please try again." });
    });
};

export const signUpUser = (request: any, response: any) => {
  const newUser = {
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    email: request.body.email,
    phoneNumber: request.body.phoneNumber,
    country: request.body.country,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    username: request.body.username,
  };

  const { valid, errors } = validateSignUpData(newUser);

  if (!valid) return response.status(400).json(errors);

  let token: any, userId: any;
  db.doc(`/users/${newUser.username}`)
    .get()
    .then((doc: { exists: any }) => {
      if (doc.exists) {
        return response
          .status(400)
          .json({ username: "this username is already taken" });
      } else {
        return createUserWithEmailAndPassword(
          auth,
          newUser.email,
          newUser.password
        );
      }
    })
    .then((data: { user: { uid: any; getIdToken: () => any } }) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idtoken: any) => {
      token = idtoken;
      const userCredentials = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
        phoneNumber: newUser.phoneNumber,
        country: newUser.country,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db.doc(`/users/${newUser.username}`).set(userCredentials);
    })
    .then(() => {
      return response.status(201).json({ token });
    })
    .catch((err: { code: string }) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return response.status(400).json({ email: "Email already in use" });
      } else {
        return response
          .status(500)
          .json({ general: "Something went wrong, please try again" });
      }
    });
};

const deleteImage = (imageName: string) => {
  const bucket = admin.storage().bucket();
  const path = `${imageName}`;
  return bucket.file(path).delete();
};

export const uploadProfilePhoto = (request: any, response: any) => {
  const busboy = BusBoy({ headers: request.headers });

  let imageFileName: string;
  let imageToBeUploaded: any = {};

  busboy.on(
    "file",
    (
      fieldname: any,
      file: any,
      filename: any,
      encoding: any,
      mimetype: any
    ) => {
      if (mimetype !== "image/png" && mimetype !== "image/jpeg") {
        return response.status(400).json({ error: "Wrong file type submited" });
      }
      const imageExtension =
        filename.split(".")[filename.split(".").length - 1];
      imageFileName = `${request.user.username}.${imageExtension}`;
      const filePath = path.join(os.tmpdir(), imageFileName);
      imageToBeUploaded = { filePath, mimetype };
      file.pipe(fs.createWriteStream(filePath));
    }
  );
  // @ts-ignore
  deleteImage(imageFileName);
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filePath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${request.user.username}`).update({
          imageUrl,
        });
      })
      .then(() => {
        return response.json({ message: "Image uploaded successfully" });
      })
      .catch((error) => {
        console.error(error);
        return response.status(500).json({ error: error.code });
      });
  });
  busboy.end(request.rawBody);
};

export const getUserDetails = (request: any, response: any) => {
  let userData: any = {};
  db.doc(`/users/${request.user.username}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.userCredentials = doc.data();
        return response.json(userData);
      }
    })
    .catch((error) => {
      console.error(error);
      return response.status(500).json({ error: error.code });
    });
};

export const updateUserDetails = (request: any, response: any) => {
  let document = db.collection("users").doc(`${request.user.username}`);
  document
    .update(request.body)
    .then(() => {
      response.json({ message: "Updated successfully" });
    })
    .catch((error) => {
      console.error(error);
      return response.status(500).json({
        message: "Cannot Update the value",
      });
    });
};
