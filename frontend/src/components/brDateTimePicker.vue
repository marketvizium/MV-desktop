<template>
  <div class="brdp" ref="root" @click="toggleOpen">
    <div
      class="brdp-input-wrapper"
      :class="{ 'is-open': isOpen, 'is-filled': !!internalDate }"
      @click="toggleOpen"
    >
      <i class="brdp-icon-calendar" aria-hidden="true"></i>
      <input
        type="text"
        class="brdp-input"
        :placeholder="placeholder"
        :value="displayValue"
        readonly
        @click="toggleOpen"
      />
      <i
        v-if="internalDate"
        class="brdp-icon-clear"
        aria-hidden="true"
        @click.stop="clear"
      ></i>
    </div>

    <Teleport to="body">
    <transition name="brdp-fade">
      <div
        v-if="isOpen"
        class="brdp-panel"
        :class="{
            'brdp-panel-top': panelPosition.openUpward,
            'brdp-panel-centered': panelPosition.centered
        }"
        :style="panelStyle"
        @click.stop
      >
        <div class="brdp-panel-body">
          <!-- Calendário -->
          <div class="brdp-calendar">
            <div class="brdp-cal-header">
              <button type="button" class="brdp-nav-btn" @click="prevMonth">
                <span class="brdp-chevron brdp-chevron-left"></span>
              </button>

              <div class="brdp-month-year">
                <button type="button" class="brdp-mes-label" @click="toggleMonthSelect">
                  {{ monthNames[viewMonth] }}
                </button>
                <button type="button" class="brdp-ano-label" @click="toggleYearSelect">
                  {{ viewYear }}
                </button>
              </div>

              <button type="button" class="brdp-nav-btn" @click="nextMonth">
                <span class="brdp-chevron brdp-chevron-right"></span>
              </button>
            </div>

            <!-- Seletor de mês -->
            <div v-if="showMonthSelect" class="brdp-select-grid">
              <button
                v-for="(m, idx) in monthNamesShort"
                :key="m"
                type="button"
                class="brdp-select-item"
                :class="{ active: idx === viewMonth }"
                @click="selectMonth(idx)"
              >
                {{ m }}
              </button>
            </div>

            <!-- Seletor de ano -->
            <div v-else-if="showYearSelect" class="brdp-select-grid">
              <button
                v-for="y in yearRange"
                :key="y"
                type="button"
                class="brdp-select-item"
                :class="{ active: y === viewYear }"
                @click="selectYear(y)"
              >
                {{ y }}
              </button>
            </div>

            <!-- Grade de dias -->
            <template v-else>
              <div class="brdp-weekdays">
                <span v-for="d in weekDays" :key="d">{{ d }}</span>
              </div>
              <div class="brdp-days">
                <button
                  v-for="(day, idx) in calendarDays"
                  :key="idx"
                  type="button"
                  class="brdp-day"
                  :class="{
                    'is-other-month': !day.currentMonth,
                    'is-selected': day.isSelected,
                    'is-today': day.isToday
                  }"
                  @click="selectDay(day)"
                >
                  {{ day.label }}
                </button>
              </div>
            </template>
          </div>

          <!-- Hora -->
          <div class="brdp-time">
            <div class="brdp-time-title">Horário</div>
            <div class="brdp-time-controls">
              <div class="brdp-time-col">
                <button type="button" class="brdp-time-btn" @click="incHour">▲</button>
                <input
                  type="text"
                  class="brdp-time-input"
                  :value="pad(hour)"
                  @input="onHourInput"
                  @blur="fixHour"
                  maxlength="2"
                  inputmode="numeric"
                />
                <button type="button" class="brdp-time-btn" @click="decHour">▼</button>
              </div>
              <span class="brdp-time-sep">:</span>
              <div class="brdp-time-col">
                <button type="button" class="brdp-time-btn" @click="incMinute">▲</button>
                <input
                  type="text"
                  class="brdp-time-input"
                  :value="pad(minute)"
                  @input="onMinuteInput"
                  @blur="fixMinute"
                  maxlength="2"
                  inputmode="numeric"
                />
                <button type="button" class="brdp-time-btn" @click="decMinute">▼</button>
              </div>
            </div>
          </div>
        </div>

        <div class="brdp-footer">
          <button type="button" class="brdp-btn brdp-btn-primary" @click="confirm">
            Confirmar
          </button>
        </div>
      </div>
    </transition>
    </Teleport>
  </div>
</template>

<script>
export default {
  name: "BrDateTimePicker",
  props: {
    modelValue: {
      // ENTRADA: aceita Date, string ou number (timestamp em ms).
      // SAÍDA (v-model / @change): SEMPRE emite number (timestamp em ms).
      // Ex: this.periodoEdicaoInicial já vem pronto para uso, sem precisar
      // chamar new Date(...).getTime() depois.
      type: [Date, String, Number],
      default: null
    },
    placeholder: {
      type: String,
      default: "Selecione data e hora"
    },
    minDate: {
      type: [Date, String, Number],
      default: null
    },
    maxDate: {
      type: [Date, String, Number],
      default: null
    }
  },
  emits: ["update:modelValue", "change"],
  data() {
    const base = this.toDate(this.modelValue) || new Date();
    return {
      isOpen: false,
      internalDate: this.toDate(this.modelValue),
      viewMonth: base.getMonth(),
      viewYear: base.getFullYear(),
      hour: this.toDate(this.modelValue) ? this.toDate(this.modelValue).getHours() : 0,
      minute: this.toDate(this.modelValue) ? this.toDate(this.modelValue).getMinutes() : 0,
      showMonthSelect: false,
      showYearSelect: false,
      panelPosition: {
        top: 0,
        left: 0,
        openUpward: false
      },
      monthNames: [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ],
      monthNamesShort: [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
      ],
      weekDays: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    };
  },
  computed: {
    panelStyle() {
        if (this.panelPosition.centered) {
            return {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
            };
        }
        return {
            position: "fixed",
            top: this.panelPosition.top + "px",
            left: this.panelPosition.left + "px"
        };
    },
    displayValue() {
      if (!this.internalDate) return "";
      return this.formatDate(this.internalDate);
    },
    yearRange() {
      const center = this.viewYear;
      const years = [];
      for (let y = center - 6; y <= center + 5; y++) years.push(y);
      return years;
    },
    calendarDays() {
      const days = [];
      const firstOfMonth = new Date(this.viewYear, this.viewMonth, 1);
      const startWeekday = firstOfMonth.getDay();
      const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
      const daysInPrevMonth = new Date(this.viewYear, this.viewMonth, 0).getDate();

      // dias do mês anterior
      for (let i = startWeekday - 1; i >= 0; i--) {
        days.push({
          label: daysInPrevMonth - i,
          currentMonth: false,
          year: this.viewMonth === 0 ? this.viewYear - 1 : this.viewYear,
          month: this.viewMonth === 0 ? 11 : this.viewMonth - 1,
          day: daysInPrevMonth - i
        });
      }
      // dias do mês atual
      for (let d = 1; d <= daysInMonth; d++) {
        days.push({
          label: d,
          currentMonth: true,
          year: this.viewYear,
          month: this.viewMonth,
          day: d,
          isToday: this.isToday(this.viewYear, this.viewMonth, d),
          isSelected: this.isSelected(this.viewYear, this.viewMonth, d)
        });
      }
      // dias do próximo mês (completar grade até 42 células)
      const nextMonthDays = 42 - days.length;
      for (let d = 1; d <= nextMonthDays; d++) {
        days.push({
          label: d,
          currentMonth: false,
          year: this.viewMonth === 11 ? this.viewYear + 1 : this.viewYear,
          month: this.viewMonth === 11 ? 0 : this.viewMonth + 1,
          day: d
        });
      }
      return days;
    }
  },
  watch: {
    modelValue(newVal) {
      const d = this.toDate(newVal);
      this.internalDate = d;
      if (d) {
        this.viewMonth = d.getMonth();
        this.viewYear = d.getFullYear();
        this.hour = d.getHours();
        this.minute = d.getMinutes();
      }
    }
  },
  mounted() {
    document.addEventListener("click", this.handleOutsideClick);
    window.addEventListener("resize", this.handleReposition);
    window.addEventListener("scroll", this.handleReposition, true);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
    window.removeEventListener("resize", this.handleReposition);
    window.removeEventListener("scroll", this.handleReposition, true);
  },
  methods: {
    toDate(value) {
      if (!value) return null;
      if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

      // Number: tratamos sempre como timestamp em ms.
      if (typeof value === "number") {
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
      }

      if (typeof value === "string") {
        // Parsing manual de strings ISO "locais" (sem timezone), ex:
        // "2026-06-18T20:17" ou "2026-06-18T20:17:00" ou "2026-06-18"
        // O construtor nativo `new Date(string)` tem comportamento
        // inconsistente entre navegadores quando a string não tem
        // timezone explícito (alguns tratam como UTC, outros como local),
        // o que causa o dia/hora "errados" dependendo do fuso do usuário.
        // Por isso construímos a data manualmente, sempre em horário local.
        const isoLocalMatch = value.match(
          /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/
        );
        if (isoLocalMatch) {
          const [, y, mo, da, h, mi, s] = isoLocalMatch;
          const d = new Date(
            Number(y),
            Number(mo) - 1,
            Number(da),
            h ? Number(h) : 0,
            mi ? Number(mi) : 0,
            s ? Number(s) : 0,
            0
          );
          return isNaN(d.getTime()) ? null : d;
        }

        // Strings com timezone explícito (Z ou +/-HH:mm) ou outros formatos:
        // delega para o parser nativo, que aqui é confiável (UTC é explícito).
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
      }

      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    },
    pad(n) {
      return n.toString().padStart(2, "0");
    },
    formatDate(date) {
      const dia = this.pad(date.getDate());
      const mes = this.pad(date.getMonth() + 1);
      const ano = date.getFullYear();
      const h = this.pad(date.getHours());
      const m = this.pad(date.getMinutes());
      return `${dia}/${mes}/${ano} ${h}:${m}`;
    },
    isToday(year, month, day) {
      const today = new Date();
      return (
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day
      );
    },
    isSelected(year, month, day) {
      if (!this.internalDate) return false;
      return (
        this.internalDate.getFullYear() === year &&
        this.internalDate.getMonth() === month &&
        this.internalDate.getDate() === day
      );
    },
    toggleOpen() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.showMonthSelect = false;
        this.showYearSelect = false;
        const base = this.internalDate || new Date();
        this.viewMonth = base.getMonth();
        this.viewYear = base.getFullYear();
        this.$nextTick(() => {
          this.calculatePosition();
        });
      }
    },
    calculatePosition() {
      const inputEl = this.$refs.root && this.$refs.root.querySelector(".brdp-input-wrapper");
      if (!inputEl) return;

  

      const rect = inputEl.getBoundingClientRect();
      const panelWidth = 320;
      const panelHeight = 410; // altura estimada do painel (calendário + footer)
      const gap = 8;
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;

      if (viewportHeight < 924) {
            this.panelPosition = { centered: true };
            return;
       }

      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Decide abrir para baixo ou para cima, conforme espaço disponível
      const openUpward = spaceBelow < panelHeight && spaceAbove > spaceBelow;

      let top = openUpward ? rect.top - panelHeight - gap : rect.bottom + gap;
      // Evita que o painel saia da tela verticalmente em casos extremos
      if (top < 4) top = 4;
      if (top + panelHeight > viewportHeight - 4 && !openUpward) {
        top = Math.max(4, viewportHeight - panelHeight - 4);
      }

      let left = rect.left;
      // Evita que o painel saia da tela horizontalmente
      if (left + panelWidth > viewportWidth - 4) {
        left = viewportWidth - panelWidth - 4;
      }
      if (left < 4) left = 4;

      this.panelPosition = { top, left, openUpward };
    },
    handleReposition() {
      if (this.isOpen) {
        this.calculatePosition();
      }
    },
    handleOutsideClick(e) {
      const clickedInsideRoot = this.$refs.root && this.$refs.root.contains(e.target);
      const clickedInsidePanel = e.target.closest && e.target.closest(".brdp-panel");
      if (!clickedInsideRoot && !clickedInsidePanel) {
        this.isOpen = false;
        this.showMonthSelect = false;
        this.showYearSelect = false;
      }
    },
    prevMonth() {
      if (this.viewMonth === 0) {
        this.viewMonth = 11;
        this.viewYear--;
      } else {
        this.viewMonth--;
      }
    },
    nextMonth() {
      if (this.viewMonth === 11) {
        this.viewMonth = 0;
        this.viewYear++;
      } else {
        this.viewMonth++;
      }
    },
    toggleMonthSelect() {
      this.showYearSelect = false;
      this.showMonthSelect = !this.showMonthSelect;
      this.$nextTick(() => this.calculatePosition());
    },
    toggleYearSelect() {
      this.showMonthSelect = false;
      this.showYearSelect = !this.showYearSelect;
      this.$nextTick(() => this.calculatePosition());
    },
    selectMonth(idx) {
      this.viewMonth = idx;
      this.showMonthSelect = false;
    },
    selectYear(y) {
      this.viewYear = y;
      this.showYearSelect = false;
    },
    selectDay(day) {
      // Ao clicar em dia de outro mês, navega para ele
      if (!day.currentMonth) {
        this.viewMonth = day.month;
        this.viewYear = day.year;
      }
      const newDate = new Date(day.year, day.month, day.day, this.hour, this.minute, 0, 0);
      this.internalDate = newDate;
      this.emitValue();
    },
    incHour() {
      this.hour = (this.hour + 1) % 24;
      this.syncTimeToInternal();
    },
    decHour() {
      this.hour = (this.hour + 23) % 24;
      this.syncTimeToInternal();
    },
    incMinute() {
      this.minute = (this.minute + 1) % 60;
      this.syncTimeToInternal();
    },
    decMinute() {
      this.minute = (this.minute + 59) % 60;
      this.syncTimeToInternal();
    },
    onHourInput(e) {
      const val = e.target.value.replace(/\D/g, "").slice(0, 2);
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        this.hour = Math.min(23, num);
      } else if (val === "") {
        this.hour = 0;
      }
      this.syncTimeToInternal();
    },
    onMinuteInput(e) {
      const val = e.target.value.replace(/\D/g, "").slice(0, 2);
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        this.minute = Math.min(59, num);
      } else if (val === "") {
        this.minute = 0;
      }
      this.syncTimeToInternal();
    },
    fixHour() {
      if (isNaN(this.hour) || this.hour < 0) this.hour = 0;
      if (this.hour > 23) this.hour = 23;
      this.syncTimeToInternal();
    },
    fixMinute() {
      if (isNaN(this.minute) || this.minute < 0) this.minute = 0;
      if (this.minute > 59) this.minute = 59;
      this.syncTimeToInternal();
    },
    syncTimeToInternal() {
      const base = this.internalDate || new Date(this.viewYear, this.viewMonth, 1);
      this.internalDate = new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate(),
        this.hour,
        this.minute,
        0,
        0
      );
      this.emitValue();
    },
    setToday() {
      const now = new Date();
      this.viewMonth = now.getMonth();
      this.viewYear = now.getFullYear();
      this.hour = now.getHours();
      this.minute = now.getMinutes();
      this.internalDate = now;
      this.showMonthSelect = false;
      this.showYearSelect = false;
      this.emitValue();
    },
    clear() {
      this.internalDate = null;
      this.emitValue();
    },
    confirm() {
      if (this.internalDate) {
        // Garante que os minutos/horas digitados estejam aplicados
        this.syncTimeToInternal();
      }
      this.isOpen = false;
      this.showMonthSelect = false;
      this.showYearSelect = false;
    },
    emitValue() {
      // Emite o v-model a cada seleção (dia, hora, minuto, "Hoje", limpar),
      // não só ao clicar em "Confirmar" — assim o valor chega imediatamente
      // a quem está usando v-model, sem depender de um clique extra.
      const value = this.internalDate ? this.internalDate.getTime() : null;
      this.$emit("update:modelValue", value);
      this.$emit("change", value);
    }
  }
};
</script>

<style scoped>
.brdp {
  position: relative;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* ===== Input ===== */
.brdp-input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  background: #ffffff;
  border: 1px solid #d8dce1;
  border-radius: 8px;
  padding: 0 10px;
  height: 42px;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.brdp-input-wrapper:hover {
  border-color: #b6bcc4;
}

.brdp-input-wrapper.is-open {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.brdp-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #1f2430;
  padding: 0 8px;
  cursor: pointer;
  font-family: inherit;
}

.brdp-input::placeholder {
  color: #9aa1ab;
}

.brdp-icon-calendar {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  position: relative;
  display: inline-block;
}
.brdp-icon-calendar::before {
  content: "";
  position: absolute;
  inset: 0;
  border: 1.6px solid #6b7280;
  border-radius: 3px;
  top: 2px;
}
.brdp-icon-calendar::after {
  content: "";
  position: absolute;
  top: -1px;
  left: 3px;
  right: 3px;
  height: 3px;
  border-left: 1.6px solid #6b7280;
  border-right: 1.6px solid #6b7280;
}

.brdp-icon-clear {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  color: #9aa1ab;
}
.brdp-icon-clear::before,
.brdp-icon-clear::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px;
  height: 1.6px;
  background: #9aa1ab;
  transform-origin: center;
}
.brdp-icon-clear::before {
  transform: translate(-50%, -50%) rotate(45deg);
}
.brdp-icon-clear::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}
.brdp-icon-clear:hover::before,
.brdp-icon-clear:hover::after {
  background: #ef4444;
}

/* ===== Painel ===== */
/* position/top/left são definidos via :style (panelStyle), calculados em JS,
   pois o painel é teleportado para o <body> e precisa ficar acima de
   qualquer container com overflow:hidden/auto ou contexto de empilhamento. */
.brdp-panel {
  z-index: 9999;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.06);
  border: 1px solid #eceff2;
  width: 320px;
  overflow: hidden;
}

.brdp-fade-enter-active,
.brdp-fade-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}
.brdp-fade-enter-from,
.brdp-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.brdp-panel-body {
  padding: 16px 16px 8px;
}

/* ===== Calendário: header ===== */
.brdp-cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.brdp-nav-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.12s ease;
}
.brdp-nav-btn:hover {
  background: #f1f3f6;
}

.brdp-chevron {
  width: 8px;
  height: 8px;
  border-top: 2px solid #4b5563;
  border-right: 2px solid #4b5563;
}
.brdp-chevron-left {
  transform: rotate(-135deg);
}
.brdp-chevron-right {
  transform: rotate(45deg);
}

.brdp-month-year {
  display: flex;
  gap: 6px;
}

.brdp-mes-label,
.brdp-ano-label {
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #1f2430;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.12s ease;
}
.brdp-mes-label:hover,
.brdp-ano-label:hover {
  background: #f1f3f6;
}

/* ===== Grades de seleção (mês/ano) ===== */
.brdp-select-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 4px 0 12px;
  max-height: 220px;
  overflow-y: auto;
}

.brdp-select-item {
  border: none;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 10px 4px;
  font-size: 13px;
  color: #1f2430;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}
.brdp-select-item:hover {
  background: #e7edfb;
}
.brdp-select-item.active {
  background: #3b82f6;
  color: #ffffff;
  font-weight: 600;
}

/* ===== Dias da semana ===== */
.brdp-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 4px;
}
.brdp-weekdays span {
  font-size: 11px;
  color: #9aa1ab;
  font-weight: 600;
  text-transform: uppercase;
  padding: 4px 0;
}

/* ===== Dias ===== */
.brdp-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.brdp-day {
  border: none;
  background: transparent;
  border-radius: 8px;
  height: 32px;
  font-size: 13px;
  color: #1f2430;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}
.brdp-day:hover {
  background: #eef2f7;
}
.brdp-day.is-other-month {
  color: #c5cad2;
}
.brdp-day.is-today {
  font-weight: 700;
  color: #3b82f6;
}
.brdp-day.is-selected {
  background: #3b82f6;
  color: #ffffff;
  font-weight: 600;
}
.brdp-day.is-selected:hover {
  background: #2f6fe0;
}

/* ===== Hora ===== */
.brdp-time {
  border-top: 1px solid #eef0f3;
  margin-top: 12px;
  padding-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brdp-time-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.brdp-time-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.brdp-time-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.brdp-time-btn {
  width: 26px;
  height: 18px;
  border: none;
  background: #f1f3f6;
  border-radius: 4px;
  font-size: 9px;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
  transition: background 0.12s ease;
}
.brdp-time-btn:hover {
  background: #e2e7ed;
}

.brdp-time-input {
  width: 38px;
  height: 32px;
  text-align: center;
  border: 1px solid #d8dce1;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2430;
  font-family: inherit;
}
.brdp-time-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.brdp-time-sep {
  font-size: 16px;
  font-weight: 700;
  color: #6b7280;
  margin: 0 2px;
}

/* ===== Rodapé ===== */
.brdp-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-top: 1px solid #eef0f3;
  background: #fafbfc;
}

.brdp-btn {
  border: none;
  border-radius: 7px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s ease, opacity 0.12s ease;
  font-family: inherit;
}

.brdp-btn-ghost {
  background: transparent;
  color: #6b7280;
}
.brdp-btn-ghost:hover {
  background: #f1f3f6;
}

.brdp-btn-primary {
  background: #3b82f6;
  color: #ffffff;
}
.brdp-btn-primary:hover {
  background: #2f6fe0;
}

.brdp-fade-enter-from,
.brdp-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.brdp-panel-centered.brdp-fade-enter-from,
.brdp-panel-centered.brdp-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.97);
}
</style>