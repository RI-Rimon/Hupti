/**
 * Taskbox - Task Planner & Smart Reminders Engine
 * Focus-preserving task management with countdown statuses, safe DOM rendering,
 * event delegation, and background throttling-resistant reminder checks.
 */

import { openModal, closeModal } from './modals.js';

const TASKS_STORAGE_KEY = 'hupti_tasks_list';

let tasks = [];

function loadTasks() {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to parse tasks from localStorage:', e);
    return [];
  }
}

function formatCountdown(targetTimestamp) {
  const diffMs = targetTimestamp - Date.now();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMs > 60 * 60 * 1000) {
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return { text: `in ${hrs}h ${mins}m`, status: 'normal', isImminent: false };
  } else if (diffMs > 5 * 60 * 1000) {
    return { text: `in ${diffMins} mins`, status: 'normal', isImminent: false };
  } else if (diffMs > 0) {
    const displayMins = diffMins <= 0 ? 1 : diffMins;
    return { text: `🔔 in ${displayMins} mins!`, status: 'imminent', isImminent: true };
  } else if (diffMs > -30 * 60 * 1000) {
    return { text: `⚠️ Due now!`, status: 'due', isImminent: true };
  } else {
    return { text: `Overdue`, status: 'due', isImminent: false };
  }
}

/**
 * Initialize Taskbox Planner
 * @param {Object} options
 * @param {Object} options.soundFX
 * @param {Object} options.huptiState
 */
export function initTaskbox({ soundFX, huptiState }) {
  const btnTaskboxToggle = document.getElementById('btnTaskboxToggle');
  const taskboxBadge = document.getElementById('taskboxBadge');
  const taskboxModal = document.getElementById('taskboxModal');
  const btnCloseTaskbox = document.getElementById('btnCloseTaskbox');
  const taskboxForm = document.getElementById('taskboxForm');
  const taskInputName = document.getElementById('taskInputName');
  const taskInputTime = document.getElementById('taskInputTime');
  const timePresetBtns = document.querySelectorAll('.btn-time-preset');
  const taskListContainer = document.getElementById('taskListContainer');
  const taskEmptyState = document.getElementById('taskEmptyState');
  const taskPendingCountBadge = document.getElementById('taskPendingCountBadge');
  const btnShowAddTask = document.getElementById('btnShowAddTask');

  tasks = loadTasks();

  const updateTaskboxBadge = () => {
    const pendingCount = tasks.length;
    if (taskboxBadge) {
      taskboxBadge.textContent = pendingCount;
      taskboxBadge.style.display = pendingCount > 0 ? 'inline-flex' : 'none';
    }
    if (taskPendingCountBadge) {
      taskPendingCountBadge.textContent = `${pendingCount} Pending`;
    }
  };

  const saveTasks = () => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to save tasks to localStorage:', e);
    }
    updateTaskboxBadge();
    renderTaskList();
  };

  const renderTaskList = () => {
    if (!taskListContainer) return;

    if (tasks.length === 0) {
      if (taskEmptyState) taskEmptyState.style.display = 'flex';
      taskListContainer.replaceChildren();
      return;
    }

    if (taskEmptyState) taskEmptyState.style.display = 'none';

    // Sort tasks by target timestamp
    tasks.sort((a, b) => a.targetTimestamp - b.targetTimestamp);

    const fragment = document.createDocumentFragment();

    tasks.forEach((task) => {
      const countdown = formatCountdown(task.targetTimestamp);

      const card = document.createElement('div');
      card.className = `task-item-card ${countdown.isImminent ? 'is-imminent' : ''}`;
      card.setAttribute('data-task-id', task.id);

      const info = document.createElement('div');
      info.className = 'task-info';

      const title = document.createElement('div');
      title.className = 'task-title';
      title.title = task.title;
      title.textContent = task.title;

      const meta = document.createElement('div');
      meta.className = 'task-meta';

      const timeSpan = document.createElement('span');
      timeSpan.textContent = `⏰ ${task.targetTimeStr}`;

      const countdownSpan = document.createElement('span');
      countdownSpan.className = `task-countdown ${countdown.status}`;
      countdownSpan.textContent = countdown.text;

      meta.appendChild(timeSpan);
      meta.appendChild(countdownSpan);
      info.appendChild(title);
      info.appendChild(meta);

      const actions = document.createElement('div');
      actions.className = 'task-item-actions';

      const doneBtn = document.createElement('button');
      doneBtn.type = 'button';
      doneBtn.className = 'btn-task-done';
      doneBtn.setAttribute('data-task-id', task.id);
      doneBtn.title = 'Mark as Done';
      doneBtn.setAttribute('aria-label', `Mark task "${task.title}" as done`);
      doneBtn.textContent = '✔ Mark as Done';

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn-task-delete';
      deleteBtn.setAttribute('data-task-id', task.id);
      deleteBtn.title = 'Delete Task';
      deleteBtn.setAttribute('aria-label', `Delete task "${task.title}"`);
      deleteBtn.textContent = '✕';

      actions.appendChild(doneBtn);
      actions.appendChild(deleteBtn);

      card.appendChild(info);
      card.appendChild(actions);

      fragment.appendChild(card);
    });

    taskListContainer.replaceChildren(fragment);
  };

  const handleCompleteTask = (taskId) => {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    tasks.splice(taskIndex, 1);
    saveTasks();

    if (soundFX) soundFX.playPurr();

    const warmQuotes = [
      `Proud of you for completing "${task.title}"! Take a deep breath and keep going. 🌸`,
      `One step closer to your goals! You did wonderfully on "${task.title}". ✨`,
      `You completed "${task.title}"! Hupti is so proud of your hard work~ 💖`,
      `Look at you go! Finished "${task.title}" like a champ. Rest your eyes for a moment~ 🌱`
    ];
    const quote = warmQuotes[Math.floor(Math.random() * warmQuotes.length)];
    if (huptiState) {
      const MOODS = window.MOODS || {};
      huptiState.setMood(MOODS.HAPPY || 'happy', 5500, quote);
    }
  };

  const handleDeleteTask = (taskId) => {
    if (soundFX) soundFX.playClick();
    tasks = tasks.filter((t) => t.id !== taskId);
    saveTasks();
  };

  // Single Delegated Listener for Task List Card Actions
  if (taskListContainer) {
    taskListContainer.addEventListener('click', (e) => {
      const doneBtn = e.target.closest('.btn-task-done');
      if (doneBtn) {
        const taskId = doneBtn.getAttribute('data-task-id');
        if (taskId) handleCompleteTask(taskId);
        return;
      }
      const deleteBtn = e.target.closest('.btn-task-delete');
      if (deleteBtn) {
        const taskId = deleteBtn.getAttribute('data-task-id');
        if (taskId) handleDeleteTask(taskId);
        return;
      }
    });
  }

  const setDefaultTaskTime = (minutesAhead = 25) => {
    if (!taskInputTime) return;
    const now = new Date(Date.now() + minutesAhead * 60000);
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    taskInputTime.value = `${hrs}:${mins}`;
  };

  const openTaskboxModal = () => {
    openModal('taskboxModal', btnTaskboxToggle);
    if (taskInputTime && !taskInputTime.value) {
      setDefaultTaskTime(25);
    }
    renderTaskList();
    if (taskInputName) taskInputName.focus();
  };

  const closeTaskboxModal = () => {
    closeModal('taskboxModal');
  };

  if (btnTaskboxToggle) btnTaskboxToggle.addEventListener('click', openTaskboxModal);
  if (btnCloseTaskbox) btnCloseTaskbox.addEventListener('click', closeTaskboxModal);

  if (btnShowAddTask) {
    btnShowAddTask.addEventListener('click', () => {
      if (taskInputName) taskInputName.focus();
    });
  }

  // Quick Preset Buttons (+15m, +25m, +45m, +60m)
  timePresetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (soundFX) soundFX.playClick();
      const mins = parseInt(btn.getAttribute('data-mins'), 10) || 25;
      setDefaultTaskTime(mins);
    });
  });

  // Task Form Submit
  if (taskboxForm) {
    taskboxForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = taskInputName ? taskInputName.value.trim() : '';
      if (!title) return;

      let timeVal = taskInputTime ? taskInputTime.value : '';
      if (!timeVal) {
        setDefaultTaskTime(25);
        timeVal = taskInputTime.value;
      }

      const [hrs, mins] = timeVal.split(':').map((v) => parseInt(v, 10));
      const targetDate = new Date();
      targetDate.setHours(hrs, mins, 0, 0);

      // If scheduled time has already passed today by more than 1 minute, assume tomorrow
      if (targetDate.getTime() < Date.now() - 60000) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      const newTask = {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        title,
        targetTimestamp: targetDate.getTime(),
        targetTimeStr: timeVal,
        preReminderFired: false,
        createdAt: Date.now()
      };

      tasks.push(newTask);
      saveTasks();

      if (soundFX) soundFX.playClick();

      if (taskInputName) taskInputName.value = '';
      setDefaultTaskTime(25);

      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    });
  }

  // Pre-Reminder and Countdown Checker
  const checkTaskReminders = () => {
    let tasksChanged = false;
    const now = Date.now();

    tasks.forEach((task) => {
      const diffMs = task.targetTimestamp - now;

      // Pre-reminder trigger: 2 to 5 minutes before scheduled target time
      if (!task.preReminderFired && diffMs > 0 && diffMs <= 5 * 60 * 1000) {
        task.preReminderFired = true;
        tasksChanged = true;

        if (soundFX) soundFX.playReminderChime();

        const reminderMsg = `Psst human, "${task.title}" is coming up in a few minutes! You've got this~ 🌸`;
        if (huptiState) {
          const MOODS = window.MOODS || {};
          huptiState.setMood(MOODS.HAPPY || 'happy', 6500, reminderMsg);
        }

        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification('Reminder from Hupti 🌸', {
              body: `Your task "${task.title}" starts in a few minutes!`,
              icon: 'favicon.ico'
            });
          } catch (err) {}
        }
      }
    });

    if (tasksChanged) {
      try {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
      } catch (e) {}
    }

    if (taskboxModal && taskboxModal.classList.contains('active')) {
      renderTaskList();
    }
  };

  // Run reminder check every 3 seconds while active
  setInterval(checkTaskReminders, 3000);

  // Run checks on visibility change and window focus to handle browser background throttling
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkTaskReminders();
    }
  });

  window.addEventListener('focus', () => {
    checkTaskReminders();
  });

  // Initial render
  updateTaskboxBadge();
  renderTaskList();

  return {
    checkTaskReminders
  };
}
