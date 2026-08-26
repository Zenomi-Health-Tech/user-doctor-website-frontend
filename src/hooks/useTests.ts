import { useEffect, useState } from "react";
import api from "@/utils/api";

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
    // Same host/DB as the write (update-test-score) - the scoring
    // service's /api/testnames is a separate service and can lag behind
    // a just-completed write, causing a just-finished test to still show
    // as incomplete until that service catches up.
    const fetchTests = async () => {
      setLoading(true);
      try {
        const res = await api.get("/users/test-status");
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
