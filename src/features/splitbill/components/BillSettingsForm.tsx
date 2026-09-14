import { Badge, Chip, Group, NumberInput, Stack, Text } from '@mantine/core'
import { CheckCircleIcon } from '@phosphor-icons/react'
import { CurrencyInput } from '#/components/CurrencyInput'
import { formatIDR } from '#/utils'
import type { BillSettings } from '#/features/splitbill/types'

interface BillSettingsFormProps {
  settings: BillSettings
  subtotal: number
  onChange: (patch: Partial<BillSettings>) => void
}

function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : Number(value) || 0
}

const TAX_PRESETS = [0, 10, 11]
const SERVICE_PRESETS = [0, 5, 10]

export function BillSettingsForm({
  settings,
  subtotal,
  onChange,
}: BillSettingsFormProps) {
  const taxEstimate = (subtotal * Math.max(0, settings.taxPercent)) / 100
  const serviceEstimate =
    (subtotal * Math.max(0, settings.servicePercent)) / 100

  return (
    <Stack gap="md">
      <Stack gap={6}>
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            Pajak (PB1)
          </Text>
          {taxEstimate > 0 && (
            <Badge size="xs" variant="light" color="orange">
              +{formatIDR(taxEstimate)}
            </Badge>
          )}
        </Group>
        <Group gap="xs">
          {TAX_PRESETS.map((v) => (
            <Chip
              key={v}
              size="xs"
              checked={settings.taxPercent === v}
              onChange={() => onChange({ taxPercent: v })}
              icon={<CheckCircleIcon size={10} weight="fill" />}
            >
              {v === 0 ? 'Tanpa pajak' : `${v}%`}
            </Chip>
          ))}
          <NumberInput
            aria-label="Pajak custom (%)"
            value={settings.taxPercent}
            onChange={(value) =>
              onChange({
                taxPercent: Math.max(0, Math.min(100, toNumber(value))),
              })
            }
            min={0}
            max={100}
            suffix=" %"
            w={100}
            size="xs"
          />
        </Group>
      </Stack>

      <Stack gap={6}>
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            Service charge
          </Text>
          {serviceEstimate > 0 && (
            <Badge size="xs" variant="light" color="blue">
              +{formatIDR(serviceEstimate)}
            </Badge>
          )}
        </Group>
        <Group gap="xs">
          {SERVICE_PRESETS.map((v) => (
            <Chip
              key={v}
              size="xs"
              checked={settings.servicePercent === v}
              onChange={() => onChange({ servicePercent: v })}
              icon={<CheckCircleIcon size={10} weight="fill" />}
            >
              {v === 0 ? 'Tanpa service' : `${v}%`}
            </Chip>
          ))}
          <NumberInput
            aria-label="Service custom (%)"
            value={settings.servicePercent}
            onChange={(value) =>
              onChange({
                servicePercent: Math.max(0, Math.min(100, toNumber(value))),
              })
            }
            min={0}
            max={100}
            suffix=" %"
            w={100}
            size="xs"
          />
        </Group>
      </Stack>

      <Stack gap={6}>
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            Diskon nominal
          </Text>
          {settings.discount > 0 && (
            <Badge size="xs" variant="light" color="teal">
              −{formatIDR(settings.discount)}
            </Badge>
          )}
        </Group>
        <CurrencyInput
          placeholder="cth. 20.000"
          value={settings.discount}
          onChange={(value) => onChange({ discount: Math.max(0, value) })}
        />
        <Text size="xs" c="dimmed">
          Diskon dibagi proporsional mengikuti porsi tiap orang.
        </Text>
      </Stack>
    </Stack>
  )
}
