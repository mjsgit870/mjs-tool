import { Badge, Card, Group, Stack, Text, ThemeIcon } from '@mantine/core'
import { Link } from '@tanstack/react-router'
import type { ToolMeta } from '#/config/tools'
import classes from './ToolCard.module.css'

export function ToolCard({ tool }: { tool: ToolMeta }) {
  const ToolIcon = tool.icon
  return (
    <Card component={Link} to={tool.href} padding="lg" className={classes.card}>
      <Stack gap="sm">
        <Group justify="space-between">
          <ThemeIcon size="xl" radius="md" variant="light" color={tool.color}>
            <ToolIcon size={22} />
          </ThemeIcon>
          <Badge
            color={tool.status === 'ready' ? 'green' : 'gray'}
            variant="light"
          >
            {tool.status === 'ready' ? 'Siap' : 'Segera'}
          </Badge>
        </Group>
        <Text fw={600}>{tool.title}</Text>
        <Text size="sm" c="dimmed">
          {tool.description}
        </Text>
      </Stack>
    </Card>
  )
}
