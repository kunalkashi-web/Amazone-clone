import axios from "axios";

const instance = axios.create({
  baseURL: "https://api-jztzonolca-uc.a.run.app"
  //"http://127.0.0.1:5001/fir-c4282/us-central1/api",
});

export default instance;
