import { NumberInput, SimpleGrid } from '@mantine/core'
import { CurrencyInput } from '#/components/CurrencyInput'
import type { BillSettings } from '#/features/splitbill/types'

interface BillSettingsFormProps {
  settings: BillSettings
  onChange: (patch: Partial<BillSettings>) => void
}

function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : Number(value) || 0
}

export function BillSettingsForm({
  settings,
  onChange,
}: BillSettingsFormProps) {
  return (
    <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="sm">
      <NumberInput
        label="Pajak (%)"
        value={settings.taxPercent}
        onChange={(value) =>
          onChange({ taxPercent: Math.max(0, toNumber(value)) })
        }
        min={0}
        max={100}
      />
      <NumberInput
        label="Service (%)"
        value={settings.servicePercent}
        onChange={(value) =>
          onChange({ servicePercent: Math.max(0, toNumber(value)) })
        }
        min={0}
        max={100}
      />
      <CurrencyInput
        label="Diskon (Rp)"
        value={settings.discount}
        onChange={(value) => onChange({ discount: Math.max(0, value) })}
      />
    </SimpleGrid>
  )
}
