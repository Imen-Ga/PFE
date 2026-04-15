import { adminAuth } from "@/firebase-admin.init";


export const deleteUserAuth = async (userId: string) => {

    try {
      await adminAuth.deleteUser(userId);
      console.log("Utilisateur supprimé dans Auth");
    } catch (error) {
      console.error(error);
    }
  }

// exports.updateUserAuth = functions.firestore
//   .document("users/{userId}")
//   .onUpdate(async (change, context) => {
//     const newData = change.after.data();
//     const userId = context.params.userId;

//     try {
//       if (newData.email) {
//         await admin.auth().updateUser(userId, {
//           email: newData.email,
//         });
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   });