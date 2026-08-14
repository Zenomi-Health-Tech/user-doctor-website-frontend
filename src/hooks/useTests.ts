import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export interface Test {
  id: string;
  name: string;
  testStatus: string;
  image_url: string;
  description: string | null;
  question_count: number;
  splash_image_s3_key?: string;
  unlockDependency?: string;
}

export function useTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const authCookie = Cookies.get("auth");
        let token = "";
        if (authCookie) {
          try {
            token = JSON.parse(authCookie).token;
          } catch {
            token = "";
          }
        }
        const res = await axios.get(
          "https://zenomiai.elitceler.com/api/testnames",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTests(Array.isArray(res.data) ? res.data : []);
      } catch {
        setTests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  return { tests, loading };
}
