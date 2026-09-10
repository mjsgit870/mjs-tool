import { Anchor, Container, Stack, Text, Title } from '@mantine/core'
import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/gitlab-activity')({
  component: GitlabActivityPage,
})

function GitlabActivityPage() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Anchor component={Link} to="/" size="sm">
          ← Kembali
        </Anchor>
        <Title order={1} size="h2">
          GitLab Activity untuk Timesheet
        </Title>
        <Text c="dimmed" size="sm">
          Halaman penarik aktivitas GitLab harian. Form token, project, dan
          hasil timesheet akan dibangun di sini.
        </Text>
      </Stack>
    </Container>
  )
}
