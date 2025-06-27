import React from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useI18n } from "../contexts/I18nContext";

// Flag emojis for each language
const FLAGS = {
  en: "🇺🇸",
  fr: "🇫🇷",
  es: "🇪🇸",
};

// Language names for tooltips
const LANGUAGE_NAMES = {
  en: "English",
  fr: "Français",
  es: "Español",
};

interface LanguageSelectorProps {
  variant?: "icon" | "menu";
  size?: "small" | "medium" | "large";
  showTooltip?: boolean;
}

const LanguageSelector = ({
  variant = "icon",
  size = "medium",
  showTooltip = true,
}: LanguageSelectorProps) => {
  const { language, setLanguage } = useI18n();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as "en" | "fr" | "es");
    handleClose();
  };

  const getIconSize = () => {
    switch (size) {
      case "small":
        return 20;
      case "large":
        return 32;
      default:
        return 24;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "small":
        return "small";
      case "large":
        return "large";
      default:
        return "medium";
    }
  };

  if (variant === "icon") {
    return (
      <>
        <Tooltip
          title={showTooltip ? `Language: ${LANGUAGE_NAMES[language]}` : ""}
          arrow
        >
          <IconButton
            onClick={handleClick}
            size={getButtonSize()}
            aria-label={`Select language. Current: ${LANGUAGE_NAMES[language]}`}
            sx={{
              fontSize: getIconSize(),
              minWidth: "44px",
              minHeight: "44px",
              "&:focus": {
                outline: "2px solid",
                outlineColor: "primary.main",
                outlineOffset: "2px",
              },
            }}
          >
            {FLAGS[language]}
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          role="menu"
          aria-label="Language selection menu"
        >
          {Object.entries(FLAGS).map(([lang, flag]) => (
            <MenuItem
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              selected={language === lang}
              role="menuitem"
              aria-label={`Select ${
                LANGUAGE_NAMES[lang as keyof typeof LANGUAGE_NAMES]
              }`}
              sx={{
                minWidth: "120px",
                "&.Mui-selected": {
                  backgroundColor: "primary.light",
                  "&:hover": {
                    backgroundColor: "primary.light",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: "36px" }}>
                <span style={{ fontSize: getIconSize() }}>{flag}</span>
              </ListItemIcon>
              <ListItemText
                primary={LANGUAGE_NAMES[lang as keyof typeof LANGUAGE_NAMES]}
                primaryTypographyProps={{
                  fontSize: size === "small" ? "0.875rem" : "1rem",
                }}
              />
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  // Menu variant - shows all languages as a horizontal row
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
      }}
      role="group"
      aria-label="Language selection"
    >
      {Object.entries(FLAGS).map(([lang, flag]) => (
        <Tooltip
          key={lang}
          title={LANGUAGE_NAMES[lang as keyof typeof LANGUAGE_NAMES]}
          arrow
        >
          <IconButton
            onClick={() => handleLanguageChange(lang)}
            size={getButtonSize()}
            color={language === lang ? "primary" : "default"}
            aria-label={`Select ${
              LANGUAGE_NAMES[lang as keyof typeof LANGUAGE_NAMES]
            }`}
            aria-pressed={language === lang}
            sx={{
              fontSize: getIconSize(),
              minWidth: "44px",
              minHeight: "44px",
              border: language === lang ? "2px solid" : "2px solid transparent",
              borderColor: language === lang ? "primary.main" : "transparent",
              "&:focus": {
                outline: "2px solid",
                outlineColor: "primary.main",
                outlineOffset: "2px",
              },
              "&:hover": {
                backgroundColor:
                  language === lang ? "primary.light" : "action.hover",
              },
            }}
          >
            {flag}
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
};

export default LanguageSelector;
