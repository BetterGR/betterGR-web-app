import dynamic from "next/dynamic";

// Dynamically import the CourseGrades component without SSR.
const CourseGrades = dynamic(() => import("../components/coursegrades"), { ssr: false });

export default function CourseGradesPage() {
  return <CourseGrades />;
}
