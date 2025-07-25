import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";

function AdminProtectedRoute() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === "admin") {
          setIsAdmin(true);
        }
      }
      setCheckingStatus(false);
    });

    return unsubscribe;
  }, []);

  if (checkingStatus) {
    return <h3>Memeriksa akses admin...</h3>;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/login" />;
}

export default AdminProtectedRoute;
