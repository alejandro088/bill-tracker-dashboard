<template>
  <div class="calendar-view">
    <h2>Calendario de facturas</h2>
    <div id="calendar"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import api from '../api.js'

onMounted(async () => {
  const calendarEl = document.getElementById('calendar')
  const calendar = new Calendar(calendarEl, {
    plugins: [ dayGridPlugin, timeGridPlugin, interactionPlugin ],
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    eventClick: (info) => {
      // Abrir detalle (navegar a BillDetails por id)
      const id = info.event.extendedProps.billId || info.event.id
      if (id) window.location.href = `/bills/${id}`
    },
    dateClick: (info) => {
      // Crear factura rápida: abrir creación manual (no implementado aquí)
      // console.log('Date clicked', info.dateStr)
    },
    eventDrop: async (info) => {
      // Actualizar dueDate de la factura (enviar solo YYYY-MM-DD)
      const id = info.event.extendedProps.billId || info.event.id
      if (!id) return
      try {
        // info.event.startStr is YYYY-MM-DD for allDay events
        const dateOnly = info.event.startStr ? info.event.startStr.slice(0,10) : info.event.start.toISOString().slice(0,10)
        await api.put(`/bills/${id}`, { dueDate: dateOnly })
      } catch (e) {
        console.error('Error updating bill date', e)
        info.revert()
      }
    }
  })

  // Fetch events for initial range (this could be optimized per view)
  try {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 1).toISOString()
    const res = await api.get('/bills', { params: { page: 1, limit: 100, start, end } })
    // Force all events to allDay and use only the YYYY-MM-DD part
    const items = (res.data.data || []).map(b => {
      const iso = b.dueDate || ''
      const dateOnly = iso.slice(0, 10)
      return {
        id: b.id,
        title: `${b.name} — ${b.amount}`,
        start: dateOnly,
        allDay: true,
        color: b.status === 'paid' ? 'green' : (b.status === 'overdue' ? 'red' : 'orange'),
        extendedProps: { billId: b.id }
      }
    })
    calendar.addEventSource(items)
  } catch (e) {
    console.error('Error fetching bills for calendar', e)
  }

  calendar.render()
})
</script>

<style scoped>
#calendar {
  max-width: 900px;
  margin: 16px auto;
}
</style>
