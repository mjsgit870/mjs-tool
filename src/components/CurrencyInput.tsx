import { NumberInput } from '@mantine/core'
import type { NumberInputProps } from '@mantine/core'

export interface CurrencyInputProps extends Omit<
  NumberInputProps,
  'onChange' | 'thousandSeparator' | 'decimalSeparator'
> {
  value?: number
  onChange?: (value: number) => void
}

/**
 * Input nominal Rupiah reusable (format id-ID: ribuan ".", desimal ",").
 * Pemisah sudah dikunci agar tidak bentrok seperti error sebelumnya.
 *
 * Contoh: <CurrencyInput label="Harga" value={price} onChange={setPrice} />
 */
export function CurrencyInput({
  value = 0,
  onChange,
  ...props
}: CurrencyInputProps) {
  return (
    <NumberInput
      thousandSeparator="."
      decimalSeparator=","
      hideControls
      min={0}
      {...props}
      value={value}
      onChange={(next) =>
        onChange?.(typeof next === 'number' ? next : Number(next) || 0)
      }
    />
  )
}
