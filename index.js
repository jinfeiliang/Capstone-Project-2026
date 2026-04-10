// let elements = document.querySelectorAll('.bg-half-dark');
// let elements_2 = document.querySelectorAll('.bg-half-dark-reverse');

//   const observer = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting) {
//         // Element is visible → trigger animation
//         entry.target.classList.add('on');

//         // Clear any pending reset
//         clearTimeout(entry.target._resetTimer);
//       } else {
//         // Element left screen → start 2s timer
//         entry.target._resetTimer = setTimeout(() => {
//           entry.target.classList.remove('on');
//         }, 2000);
//       }
//     });
//   }, {
//     threshold: 0
//   });
// elements.forEach(el => observer.observe(el));
// elements_2.forEach(el => observer.observe(el));
document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll(
    ".bg-half-dark, .bg-half-dark-reverse",
  );
  const infoSection = document.getElementById("Information");

  let resetTimer = null;

  // 1. Observe each element individually (trigger animation)
  const elementObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("on");
        }
      });
    },
    {
      threshold: 0,
    },
  );

  elements.forEach((el) => elementObserver.observe(el));

  // 2. Observe the Information section (controls reset)
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          // Section is OUT of view → start 2s timer
          resetTimer = setTimeout(() => {
            elements.forEach((el) => el.classList.remove("on"));
          }, 2000);
        } else {
          // Section is back → cancel reset
          clearTimeout(resetTimer);
        }
      });
    },
    {
      threshold: 0,
    },
  );

  sectionObserver.observe(infoSection);
});
