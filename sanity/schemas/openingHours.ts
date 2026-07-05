import { defineType, defineField } from 'sanity'

export const openingHours = defineType({
  name: 'openingHours',
  title: 'Opening Hours',
  type: 'document',
  fields: [
    defineField({
      name: 'day',
      title: 'Day',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order (0=Mon, 6=Sun)',
      type: 'number',
    }),
    defineField({
      name: 'openHour',
      title: 'Opening Hour',
      type: 'number',
      description: 'e.g. 12 for noon, 5 for 5pm',
    }),
    defineField({
      name: 'openSuffix',
      title: 'Opening Suffix',
      type: 'string',
      description: 'e.g. ":00pm"',
    }),
    defineField({
      name: 'closeHour',
      title: 'Closing Hour',
      type: 'number',
    }),
    defineField({
      name: 'closeSuffix',
      title: 'Closing Suffix',
      type: 'string',
      description: 'e.g. ":00pm"',
    }),
    defineField({
      name: 'kitchenHours',
      title: 'Kitchen Hours',
      type: 'string',
      description: 'e.g. "noon-3pm & 6-9pm"',
    }),
    defineField({
      name: 'note',
      title: 'Note',
      type: 'string',
      description: 'Optional note shown below kitchen hours',
    }),
  ],
  orderings: [
    {
      title: 'Day of Week',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
})
