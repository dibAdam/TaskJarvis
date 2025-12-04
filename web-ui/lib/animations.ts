import { Variants } from 'framer-motion';

// Task Card Animations
export const taskCardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    filter: 'blur(4px)',
    transition: {
      duration: 0.4,
      ease: 'easeInOut'
    }
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20
    }
  },
  tap: {
    scale: 0.98
  }
};

// Task Completion Animation
export const completionVariants: Variants = {
  initial: { scale: 1, opacity: 1 },
  complete: {
    scale: [1, 1.05, 0.95],
    opacity: [1, 1, 0],
    transition: {
      duration: 0.6,
      times: [0, 0.4, 1],
      ease: 'easeInOut'
    }
  }
};

// Particle Burst for Completion
export const particleVariants: Variants = {
  initial: { opacity: 1, scale: 0 },
  animate: (i: number) => ({
    opacity: 0,
    scale: 1,
    x: Math.cos((i / 12) * Math.PI * 2) * 120,
    y: Math.sin((i / 12) * Math.PI * 2) * 120,
    transition: {
      duration: 0.8,
      ease: 'easeOut'
    }
  })
};

// Task Group Animations
export const groupContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const groupHeaderVariants: Variants = {
  collapsed: { 
    rotate: 0,
    transition: { duration: 0.2 }
  },
  expanded: { 
    rotate: 90,
    transition: { duration: 0.2 }
  }
};

// AI Avatar Animations
export const avatarVariants: Variants = {
  idle: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },
  thinking: {
    scale: [1, 1.1, 1],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },
  responding: {
    scale: 1.05,
    transition: {
      duration: 0.3
    }
  }
};

export const glowVariants: Variants = {
  idle: {
    opacity: [0.5, 0.8, 0.5],
    scale: [1, 1.2, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },
  thinking: {
    opacity: [0.6, 1, 0.6],
    scale: [1, 1.4, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Message Animations
export const messageVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30
    }
  }
};

// Typing Indicator Animation
export const typingDotVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-4, 0, -4],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Priority Glow Animation
export const priorityGlowVariants: Variants = {
  high: {
    boxShadow: [
      '0 0 10px rgba(239, 68, 68, 0.5)',
      '0 0 20px rgba(239, 68, 68, 0.8)',
      '0 0 10px rgba(239, 68, 68, 0.5)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },
  medium: {
    boxShadow: '0 0 8px rgba(251, 191, 36, 0.4)'
  },
  low: {
    boxShadow: '0 0 6px rgba(59, 130, 246, 0.3)'
  }
};

// Tab Animation
export const tabUnderlineVariants: Variants = {
  initial: { scaleX: 0 },
  animate: { 
    scaleX: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30
    }
  }
};

// Page Transition
export const pageVariants: Variants = {
  initial: { 
    opacity: 0,
    y: 20
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};
