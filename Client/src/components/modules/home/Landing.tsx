import TravelAnimation from "./Animation";
import styles from "./Landing.module.css";

export default function Landing() {
  return (
    <div className={styles.banner}>
      <div className={styles.animateZoom} />
      <div className={styles.overlay}>
        <div className="flex items-center flex-col lg:flex-row">
          
          <div className="flex-1">
            <div className="lg:flex justify-center items-center hidden">
              <TravelAnimation />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
