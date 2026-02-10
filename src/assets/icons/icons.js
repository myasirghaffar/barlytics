import React from "react";
import Svg, {
  Path,
  G,
  ClipPath,
  Defs,
  Rect,
  LinearGradient,
  Stop,
} from "react-native-svg";

export function BackArrowIcon({
  width = 24,
  height = 24,
  color = "white",
  opacity = 0.7,
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11.9948 18.9918L4.9978 11.9948L11.9948 4.99783"
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth="1.99913"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.9917 11.9948H4.9978"
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth="1.99913"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EditIcon({
  width = 16,
  height = 16,
  color = "#FDC700",
  opacity = 1,
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Defs>
        <ClipPath id="clip0_28_2722">
          <Rect width="15.9931" height="15.9931" fill="white" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip0_28_2722)">
        <Path
          d="M14.1098 4.53938C14.4622 4.18715 14.6601 3.70939 14.6602 3.21119C14.6602 2.713 14.4624 2.23519 14.1102 1.88287C13.7579 1.53055 13.2802 1.33258 12.782 1.33252C12.2838 1.33246 11.806 1.5303 11.4537 1.88253L2.56019 10.778C2.40547 10.9323 2.29105 11.1222 2.227 11.3311L1.34671 14.2312C1.32949 14.2888 1.32819 14.35 1.34295 14.4083C1.35771 14.4666 1.38798 14.5199 1.43054 14.5624C1.47311 14.6049 1.52638 14.635 1.58472 14.6497C1.64305 14.6644 1.70426 14.663 1.76187 14.6457L4.66261 13.766C4.8713 13.7026 5.06122 13.5888 5.2157 13.4349L14.1098 4.53938Z"
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth="1.33275"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}

export function RemoveIcon({
  width = 20,
  height = 20,
  color = "white",
  opacity = 1,
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18"
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 6L18 18"
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TrophyIcon({
  width = 204,
  height = 204,
  color = "white",
  opacity = 1,
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 204 204" fill="none">
      <Defs>
        <LinearGradient
          id="trophyGradient"
          x1="38"
          y1="13"
          x2="165.985"
          y2="140.985"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#FDC700" />
          <Stop offset="1" stopColor="#D08700" />
        </LinearGradient>
      </Defs>
      <G>
        <Path
          d="M38 76.9925C38 41.6504 66.6504 13 101.992 13C137.335 13 165.985 41.6504 165.985 76.9925C165.985 112.335 137.335 140.985 101.992 140.985C66.6504 140.985 38 112.335 38 76.9925Z"
          fill="url(#trophyGradient)"
        />
        <Path
          d="M81.9862 66.9943H76.9871C74.7774 66.9943 72.6581 66.1164 71.0956 64.5539C69.5331 62.9914 68.6553 60.8722 68.6553 58.6624C68.6553 56.4527 69.5331 54.3335 71.0956 52.7709C72.6581 51.2084 74.7774 50.3306 76.9871 50.3306H81.9862"
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth="6.66546"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M121.979 66.9943H126.978C129.188 66.9943 131.307 66.1164 132.87 64.5539C134.432 62.9914 135.31 60.8722 135.31 58.6624C135.31 56.4527 134.432 54.3335 132.87 52.7709C131.307 51.2084 129.188 50.3306 126.978 50.3306H121.979"
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth="6.66546"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M75.3208 110.32H128.644"
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth="6.66546"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M95.317 85.8575V93.6561C95.317 95.4891 93.7507 96.9222 92.0843 97.6887C88.1517 99.4884 85.3188 104.454 85.3188 110.32"
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth="6.66546"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M108.648 85.8575V93.6561C108.648 95.4891 110.214 96.9222 111.881 97.6887C115.813 99.4884 118.646 104.454 118.646 110.32"
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth="6.66546"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M121.979 43.6652H81.9863V66.9943C81.9863 72.2976 84.0931 77.3838 87.8431 81.1338C91.5932 84.8839 96.6793 86.9906 101.983 86.9906C107.286 86.9906 112.372 84.8839 116.122 81.1338C119.872 77.3838 121.979 72.2976 121.979 66.9943V43.6652Z"
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth="6.66546"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}

export function RematchIcon({
  width = 16,
  height = 16,
  color = "white",
  strokeWidth = 1.33275,
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Path
        d="M1.99902 7.99653C1.99902 9.1827 2.35076 10.3422 3.00977 11.3285C3.66877 12.3148 4.60543 13.0835 5.70131 13.5374C6.7972 13.9913 8.00307 14.1101 9.16645 13.8787C10.3298 13.6473 11.3985 13.0761 12.2372 12.2373C13.076 11.3986 13.6472 10.3299 13.8786 9.16656C14.11 8.00318 13.9912 6.7973 13.5373 5.70142C13.0834 4.60554 12.3147 3.66888 11.3284 3.00987C10.3421 2.35087 9.18259 1.99913 7.99642 1.99913C6.31978 2.00544 4.71049 2.65966 3.50504 3.825L1.99902 5.33102"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1.99902 1.99913V5.33102H5.33091"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HomeIcon({
  width = 16,
  height = 16,
  color = "white",
  strokeWidth = 1.33275,
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Path
        d="M9.99582 13.9939V8.6629C9.99582 8.48616 9.92561 8.31667 9.80064 8.1917C9.67567 8.06673 9.50618 7.99652 9.32944 7.99652H6.66394C6.4872 7.99652 6.31771 8.06673 6.19274 8.1917C6.06777 8.31667 5.99756 8.48616 5.99756 8.6629V13.9939"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1.99902 6.6638C1.99898 6.46993 2.04123 6.27838 2.12283 6.10252C2.20443 5.92666 2.32341 5.77072 2.47149 5.64558L7.13613 1.64798C7.37668 1.44467 7.68146 1.33313 7.99642 1.33313C8.31138 1.33313 8.61616 1.44467 8.85671 1.64798L13.5214 5.64558C13.6694 5.77072 13.7884 5.92666 13.87 6.10252C13.9516 6.27838 13.9939 6.46993 13.9938 6.6638V12.6612C13.9938 13.0147 13.8534 13.3537 13.6035 13.6036C13.3535 13.8535 13.0145 13.9939 12.6611 13.9939H3.33178C2.97831 13.9939 2.63932 13.8535 2.38938 13.6036C2.13944 13.3537 1.99902 13.0147 1.99902 12.6612V6.6638Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SummaryTrophyIcon({
  width = 80,
  height = 80,
  color = "white",
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 80 80" fill="none">
      {/* Left handle */}
      <G transform="translate(6.67, 13.33)">
        <Path
          d="M16.6634 19.9964H11.6643C9.45461 19.9964 7.33537 19.1186 5.77285 17.556C4.21033 15.9935 3.33252 13.8743 3.33252 11.6646C3.33252 9.45482 4.21033 7.33559 5.77285 5.77307C7.33537 4.21055 9.45461 3.33273 11.6643 3.33273H16.6634"
          stroke={color}
          strokeWidth="6.66546"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      {/* Right handle */}
      <G transform="translate(59.99, 13.33)">
        <Path
          d="M3.33252 19.9964H8.33161C10.5414 19.9964 12.6606 19.1186 14.2231 17.556C15.7856 15.9935 16.6634 13.8743 16.6634 11.6646C16.6634 9.45482 15.7856 7.33559 14.2231 5.77307C12.6606 4.21055 10.5414 3.33273 8.33161 3.33273H3.33252"
          stroke={color}
          strokeWidth="6.66546"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      {/* Base line */}
      <G transform="translate(13.33, 73.32)">
        <Path
          d="M3.33252 3.33273H56.6562"
          stroke={color}
          strokeWidth="6.66546"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      {/* Left stand */}
      <G transform="translate(23.33, 48.86)">
        <Path
          d="M13.3307 3.33273V11.1313C13.3307 12.9643 11.7643 14.3974 10.098 15.1639C6.16534 16.9636 3.33252 21.9294 3.33252 27.795"
          stroke={color}
          strokeWidth="6.66546"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      {/* Right stand */}
      <G transform="translate(46.66, 48.86)">
        <Path
          d="M3.33252 3.33273V11.1313C3.33252 12.9643 4.8989 14.3974 6.56527 15.1639C10.4979 16.9636 13.3307 21.9294 13.3307 27.795"
          stroke={color}
          strokeWidth="6.66546"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      {/* Cup body */}
      <G transform="translate(20, 6.67)">
        <Path
          d="M43.3253 3.33273H3.33252V26.6618C3.33252 31.9652 5.43928 37.0514 9.18932 40.8014C12.9394 44.5515 18.0255 46.6582 23.3289 46.6582C28.6323 46.6582 33.7184 44.5515 37.4685 40.8014C41.2185 37.0514 43.3253 31.9652 43.3253 26.6618V3.33273Z"
          stroke={color}
          strokeWidth="6.66546"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}

