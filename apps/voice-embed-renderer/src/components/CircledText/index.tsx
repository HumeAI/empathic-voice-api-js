import { AnimatePresence, motion } from 'framer-motion';

export const CircledText = (props: { children: React.ReactNode }) => {
  return (
    <span className={'relative inline-block'}>
      <AnimatePresence>
        <motion.svg
          width="251"
          height="57"
          viewBox="0 0 251 57"
          fill="none"
          className={
            'absolute inset-0 z-[-1] size-full translate-y-[8%] scale-[105%]'
          }
        >
          <motion.path
            d="M39.4234 16.9562C37.7621 16.2795 34.5355 14.0331 34.2292 12.0579C33.7135 8.73267 41.5416 7.92929 43.5176 7.50939C57.9382 4.44507 72.9392 3.82934 87.6158 3.13768C108.63 2.14737 129.754 1.69699 150.788 2.22007C171.093 2.72503 191.491 5.10489 211.367 9.31326C221.987 11.5619 237.938 13.7629 246.097 21.8696C262.969 38.6314 201.037 48.4694 195.213 49.2257C148.222 55.3279 99.574 56.3023 52.2887 53.5125C47.4757 53.2285 -12.1049 49.6295 5.11423 33.0081C14.7425 23.7141 30.4693 19.0861 42.9875 15.9072C65.0653 10.3008 87.7709 6.80194 110.504 5.52464C139.125 3.91646 171.045 3.9525 198.199 14.646"
            stroke="#FFB770"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1000"
            initial={{
              strokeDashoffset: 1000,
            }}
            animate={{
              strokeDashoffset: 0,
            }}
            transition={{
              delay: 0.5,
              duration: 1,
              ease: 'easeIn',
            }}
          />
        </motion.svg>
      </AnimatePresence>

      {props.children}
    </span>
  );
};
