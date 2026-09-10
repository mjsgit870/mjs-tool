import { Container, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { ToolCard } from '#/components/ToolCard'
import { tools } from '#/config/tools'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Stack gap="xs">
          <Title order={1} size="h2">
            Pilih Tool
          </Title>
          <Text c="dimmed" size="sm">
            Kumpulan tool kecil untuk kebutuhan harian.
          </Text>
        </Stack>
        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  )
}
