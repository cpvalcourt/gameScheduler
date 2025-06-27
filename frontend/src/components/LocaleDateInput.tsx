import React, { forwardRef } from "react";
import { TextField } from "@mui/material";
import { useI18n } from "../contexts/I18nContext";
import { getDateInputPlaceholder, toDateInputFormat } from "../utils/dateUtils";

interface LocaleDateInputProps {
  value?: string;
  onChange?: (event: any) => void;
  onBlur?: (event: any) => void;
  onFocus?: (event: any) => void;
  placeholder?: string;
  label?: string;
  name?: string;
  fullWidth?: boolean;
  margin?: "none" | "dense" | "normal";
  variant?: "outlined" | "filled" | "standard";
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
  sx?: any;
  InputLabelProps?: any;
  inputProps?: any;
}

const LocaleDateInput = forwardRef<HTMLDivElement, LocaleDateInputProps>(
  ({ value, onChange, onBlur, onFocus, placeholder, ...props }, ref) => {
    const { t, language } = useI18n();

    // Convert the value to the format expected by HTML date inputs (YYYY-MM-DD)
    const inputValue = value ? toDateInputFormat(value, language) : "";

    // Get locale-aware placeholder
    const localePlaceholder = getDateInputPlaceholder(language, t);

    return (
      <TextField
        {...props}
        ref={ref}
        type="date"
        value={inputValue}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder || localePlaceholder}
        InputLabelProps={{
          shrink: true,
          ...props.InputLabelProps,
        }}
        inputProps={{
          "aria-label": props["aria-label"] || t("common.date"),
          ...props.inputProps,
        }}
        sx={{
          "& .MuiInputBase-root": {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          },
          "& .MuiInputBase-root:hover": {
            backgroundColor: "rgba(25, 118, 210, 0.08)",
          },
          "&:focus-within": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: "2px",
          },
          ...props.sx,
        }}
      />
    );
  }
);

LocaleDateInput.displayName = "LocaleDateInput";

export default LocaleDateInput;
