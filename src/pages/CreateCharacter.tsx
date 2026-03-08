import { useState } from 'react';
import { Container, Stepper, Button, Group, Title, Alert, Paper } from '@mantine/core';
import { useForm, FormProvider, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import type { WizardFormData } from '@/types/wizard';
import { wizardSchema, WIZARD_DEFAULTS, STEP_FIELDS } from '@/types/wizard';
import { useCreateCharacter } from '@/hooks/useCreateCharacter';
import { StepBasics } from '@/components/create/StepBasics';
import { StepClass } from '@/components/create/StepClass';
import { StepBackground } from '@/components/create/StepBackground';
import { StepRace } from '@/components/create/StepRace';
import { StepAbilityScores } from '@/components/create/StepAbilityScores';
import { StepReview } from '@/components/create/StepReview';
import { surfaceStyle, cardStyle } from '@/theme/styles';

const STEP_LABELS = ['Basics', 'Class', 'Background', 'Species', 'Abilities', 'Review'];

export function CreateCharacter() {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const { createCharacter, saving, error: saveError } = useCreateCharacter();

  const methods = useForm<WizardFormData>({
    defaultValues: WIZARD_DEFAULTS,
    resolver: zodResolver(wizardSchema) as unknown as Resolver<WizardFormData>,
    mode: 'onTouched',
  });

  const { trigger } = methods;

  async function handleNext() {
    const fieldsToValidate = STEP_FIELDS[active];
    const valid = await trigger(fieldsToValidate);
    if (valid) {
      setActive(prev => Math.min(prev + 1, 5));
    }
  }

  function handleBack() {
    setActive(prev => Math.max(prev - 1, 0));
  }

  async function handleSubmit() {
    const valid = await trigger();
    if (!valid) return;

    const formData = methods.getValues();
    const character = await createCharacter(formData);
    if (character?.id) {
      notifications.show({
        title: 'Character created!',
        message: `${formData.name} is ready for adventure.`,
        color: 'gold',
      });
      navigate(`/character/${character.id}`);
    }
  }

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="lg">Create Character</Title>

      <Stepper
        active={active}
        onStepClick={setActive}
        allowNextStepsSelect={false}
        size="sm"
        color="inkBrown"
        mb="xl"
      >
        {STEP_LABELS.map((label, i) => (
          <Stepper.Step key={i} label={label} />
        ))}
      </Stepper>

      <Paper p="md" style={cardStyle} pb={60}>
        <FormProvider {...methods}>
          <form onSubmit={e => e.preventDefault()}>
            {active === 0 && <StepBasics />}
            {active === 1 && <StepClass />}
            {active === 2 && <StepBackground />}
            {active === 3 && <StepRace />}
            {active === 4 && <StepAbilityScores />}
            {active === 5 && <StepReview />}
          </form>
        </FormProvider>
      </Paper>

      {saveError && (
        <Alert icon={<IconAlertCircle size={16} />} color="bloodRed" mt="md">
          {saveError}
        </Alert>
      )}

      <Group
        justify="space-between"
        p="md"
        style={{
          position: 'sticky',
          bottom: 0,
          ...surfaceStyle,
          borderTop: '1px solid rgba(191, 157, 100, 0.15)',
          zIndex: 10,
        }}
      >
        <Button
          variant="default"
          onClick={handleBack}
          disabled={active === 0}
        >
          Back
        </Button>

        {active < 5 ? (
          <Button onClick={handleNext} color="inkBrown">
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            color="gold"
            loading={saving}
          >
            Create Character
          </Button>
        )}
      </Group>
    </Container>
  );
}
