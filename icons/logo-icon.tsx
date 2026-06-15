import { FC } from "react";

interface LogoIconProps {
  className?: string;
}

const LogoIcon: FC<LogoIconProps> = ({ className = "" }) => {
  return (
    <img src="/favicons/android-icon-48x48.png" alt="Logo" className={className} />
  );
};

export default LogoIcon;
