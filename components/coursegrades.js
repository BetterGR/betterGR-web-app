// components/CourseGrades.js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function CourseGrades() {
  const router = useRouter();
  const { studentId, courseId } = router.query;

  const [grades, setGrades] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (studentId && courseId) {
      fetchGrades(studentId, courseId);
    }
  }, [studentId, courseId]);

  const fetchGrades = async (studentId, courseId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/grades/${studentId}/${courseId}`
      );
      if (!response.ok) throw new Error("Failed to fetch grades");
      const data = await response.json();
      setGrades(data);
    } catch (err) {
      console.error("Error fetching grades:", err);
      setError("Error fetching grades.");
    }
  };

  return (
    <div style={styles.container}>
      <Image
        src="/r8.jpg"
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        priority
        style={{ zIndex: -1 }}
      />
      <div style={styles.overlay}>
        <h1 style={styles.title}>Course Grades</h1>
        {error && <p style={styles.error}>{error}</p>}
        {grades ? (
          <div style={styles.gradesContainer}>
            <h2 style={styles.sectionTitle}>Exams:</h2>
            {grades.exams?.map((exam, index) => (
              <p key={index} style={styles.gradeText}>
                {exam.exam_type ? `${exam.exam_type}: ${exam.grade}` : "No exam data"}
              </p>
            ))}
            <h2 style={styles.sectionTitle}>Homeworks:</h2>
            {grades.homeworks?.map((hw, index) => (
              <p key={index} style={styles.gradeText}>
                {hw.homework_number
                  ? `HW ${hw.homework_number}: ${hw.grade}`
                  : "No homework data"}
              </p>
            ))}
          </div>
        ) : (
          <p style={styles.loading}>Loading grades...</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    height: "100vh",
    width: "100%",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  overlay: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: "80%",
    maxWidth: "600px",
  },
  title: { fontSize: "3rem", marginBottom: "20px" },
  sectionTitle: { fontSize: "2rem", marginBottom: "10px" },
  gradeText: { fontSize: "1.5rem", marginBottom: "10px" },
  error: { color: "red", fontSize: "1.2rem" },
  loading: { fontSize: "1.5rem" },
};
