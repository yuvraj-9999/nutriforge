import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * InputField — Grounded app-ready form field with premium tactile depth.
 * Soft stone borders and a warm graphite background surface.
 */
const InputField = forwardRef(
  (
    {
      id,
      label,
      type = "text",
      placeholder,
      value,
      onChange,
      onBlur,
      error,
      rightElement,
      className = "",
      disabled = false,
      ...rest
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const hasError = Boolean(error);

    // Three border states — idle, focused, error
    const borderColor = hasError
      ? "#D26E64" // clean, soft red
      : focused
      ? "#B2967D" // brushed copper sienna accent
      : "#2C2A29"; // subtle warm stone border

    // Tactile inset shadow to give input fields recessed depth
    const insetShadow = "inset 0 2px 4px rgba(0, 0, 0, 0.22)";
    const ringStyle =
      focused && !hasError
        ? { boxShadow: `${insetShadow}, 0 0 0 3px rgba(178, 150, 125, 0.08)` }
        : { boxShadow: insetShadow };

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-[13px] font-semibold select-none text-left"
            style={{ color: "#F5F4F2" }}
          >
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={[
              "w-full rounded-lg text-[14px] outline-none transition-all duration-200",
              "px-3.5 py-[11px]",
              rightElement ? "pr-11" : "",
              disabled ? "opacity-50 cursor-not-allowed" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              background: disabled ? "#181716" : "#22201F",
              border: `1px solid ${borderColor}`,
              color: "#F5F4F2",
              caretColor: "#B2967D",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              ...ringStyle,
            }}
            onFocus={() => setFocused(true)}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />

          {rightElement && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {rightElement}
            </span>
          )}
        </div>

        <AnimatePresence initial={false}>
          {hasError && (
            <motion.p
              key="field-error"
              role="alert"
              className="text-[12px] text-left"
              style={{ color: "#D26E64" }}
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.15 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

InputField.displayName = "InputField";
export default InputField;
