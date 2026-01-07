// This file contains the JavaScript code that handles the logic of the age calculator.

document.addEventListener('DOMContentLoaded', () => {
    const dobEl = document.getElementById('dob');
    const resultEl = document.getElementById('result');
    const calcBtn = document.getElementById('calc');
    const clearBtn = document.getElementById('clear');

    (function setMaxDate(){
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth()+1).padStart(2,'0');
        const dd = String(today.getDate()).padStart(2,'0');
        dobEl.max = `${yyyy}-${mm}-${dd}`;
    })();

    function diffYMD(from, to){
        let y = to.getFullYear() - from.getFullYear();
        let m = to.getMonth() - from.getMonth();
        let d = to.getDate() - from.getDate();
        if (d < 0) {
            const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
            d += prevMonth.getDate();
            m -= 1;
        }
        if (m < 0) { m += 12; y -= 1; }
        return { years: y, months: m, days: d };
    }

    function daysBetween(a,b){
        const msPerDay = 24*60*60*1000;
        const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
        return Math.floor((utcB - utcA) / msPerDay);
    }

    function nextBirthdayFrom(dob, today){
        const next = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        if (next < today) next.setFullYear(next.getFullYear()+1);
        const diff = daysBetween(today, next);
        return { date: next, inDays: diff };
    }

    function formatDate(d){
        return d.toLocaleDateString(undefined, {year:'numeric',month:'short',day:'numeric'});
    }

    function showError(msg){
        resultEl.classList.add('show');
        resultEl.innerHTML = `<div class="big">⚠️ ${msg}</div><div class="muted">Please select a valid birthdate.</div>`;
    }

    function calculateAge(){
        const val = dobEl.value;
        if (!val) { showError('No date provided'); return; }
        const dob = new Date(val);
        const today = new Date();
        if (dob > today) { showError('Future dates are not allowed'); return; }

        const ymd = diffYMD(dob, today);
        const totalDays = daysBetween(dob, today);
        const next = nextBirthdayFrom(dob, today);

        resultEl.innerHTML = `
            <div class="big">🎉 Your age: ${ymd.years} years, ${ymd.months} months, ${ymd.days} days</div>
            <div class="muted">Total time: <span class="pill">${totalDays} days</span> · Next birthday: <span class="pill">${formatDate(next.date)}</span> (in ${next.inDays} days)</div>
            <div class="actions">
                <button id="copy" class="ghost">Copy Result</button>
                <button id="share" class="ghost">Share</button>
            </div>
        `;
        resultEl.classList.add('show');

        document.getElementById('copy').addEventListener('click', () => {
            const text = `Age: ${ymd.years} years, ${ymd.months} months, ${ymd.days} days · Total ${totalDays} days`;
            navigator.clipboard?.writeText(text).then(()=> {
                alert('Copied to clipboard');
            }).catch(()=> alert('Copy failed'));
        });

        document.getElementById('share').addEventListener('click', () => {
            const shareText = `I am ${ymd.years} years, ${ymd.months} months, ${ymd.days} days old (total ${totalDays} days)`;
            if (navigator.share) {
                navigator.share({text: shareText}).catch(()=>{/* ignore */});
            } else {
                alert(shareText);
            }
        });
    }

    calcBtn.addEventListener('click', calculateAge);
    clearBtn.addEventListener('click', () => {
        dobEl.value = '';
        resultEl.classList.remove('show');
        resultEl.innerHTML = '';
        dobEl.focus();
    });

    dobEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') calculateAge();
    });
});