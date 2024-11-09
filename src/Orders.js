import React, { useState, useEffect } from "react";
import { db } from "./firebase"; // Import Firestore database
import "./Orders.css";
import { useStateValue } from "./StateProvider";
import Order from "./Order"; // Import your Order component
import {
  collection,
  doc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

function Orders() {
  const [{ user }] = useStateValue(); // Destructure user from state
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      // Create a query to get orders, ordered by 'created' in descending order
      const ordersQuery = query(
        collection(doc(db, "users", user.uid), "orders"),
        orderBy("created", "desc")
      );

      // Set up a real-time listener to fetch orders
      const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
        setOrders(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
        );
      });

      // Cleanup the listener on component unmount
      return () => unsubscribe();
    } else {
      setOrders([]);
    }
  }, [user]);

  return (
    <div className="orders">
      <h1>Your Orders</h1>
      <div className="orders__order">
        {orders.map((order) => (
          <Order key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}

export default Orders;
