import Select, { GroupBase, OptionsOrGroups } from "react-select";
import { StateManagerProps } from "react-select/dist/declarations/src/useStateManager";

function AppSelect(props: {
  readonly value: any;
  readonly onChange: (value: any) => void;
  readonly options: StateManagerProps["options"];
  readonly isSearchable?: StateManagerProps["isSearchable"];
  readonly menuPlacement?: StateManagerProps["menuPlacement"];
  readonly placeholder?: StateManagerProps["placeholder"];
  readonly disabled?: boolean;
  readonly tabIndex?: number;
  readonly isMulti?: boolean;
  readonly size?: "sm" | "md";
}) {
  const {
    isSearchable,
    menuPlacement,
    onChange,
    options,
    placeholder,
    value,
    disabled,
    tabIndex,
    isMulti,
    size,
  } = props;
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      border: `1px solid #e2e8f0`,
      fontSize: size === "sm" ? 14 : 16,
      padding: size === "sm" ? 0 : 2,
      borderRadius: "0.375rem",
      margin: size === "sm" ? "0" : "4px 0",
      "&:hover": {
        borderColor: "#cbd5e0",
      },
      minWidth: size === "sm" ? "134px" : "160px",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      fontSize: size === "sm" ? 12 : 14,
    }),
  };
  const getValue = (
    options: OptionsOrGroups<unknown, GroupBase<unknown>> | undefined,
    value: any
  ) => {
    let label = "";
    let optionsTemp: {
      label: string;
      value: any;
    }[] = options as any;
    if (isMulti) {
      return optionsTemp.filter(
        (obj) => (value as any[]).indexOf(obj.value) >= 0
      );
    } else {
      if (optionsTemp?.length) {
        optionsTemp.forEach((op) => {
          if (
            op?.value !== undefined &&
            op?.value !== null &&
            op?.value !== "" &&
            String(op.value).toLowerCase() === String(value).toLowerCase()
          ) {
            label = op.label;
          }
        });
      }
      if (label) {
        return { label: label, value: value };
      } else {
        return null;
      }
    }
  };
  return (
    <Select
      isSearchable={isSearchable}
      menuPlacement={menuPlacement ?? "bottom"}
      options={options}
      placeholder={placeholder ?? "Select"}
      value={getValue(options, value)}
      styles={customStyles}
      onChange={(newValue: any) => {
        if (isMulti) {
          onChange(newValue.map((obj: any) => obj.value));
          return;
        }
        onChange(newValue?.value!);
      }}
      isDisabled={disabled}
      autoFocus={false}
      tabIndex={tabIndex}
      isMulti={isMulti}
    />
  );
}

export default AppSelect;
