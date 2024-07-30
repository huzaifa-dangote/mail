document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const body = document.querySelector('#compose-body');

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  recipients.value = '';
  subject.value = '';
  body.value = '';

    document.querySelector('#compose-form').addEventListener('submit', event => {
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: recipients.value,
                subject: subject.value,
                body: body.value
            })
        })
            .then(response => response.json())
            .then(result => {
                console.log(result);
            })
        event.preventDefault();
        setTimeout(() => load_mailbox('sent'), 500);
    })
}

function reply_email(email_id) {
    const recipients = document.querySelector('#compose-recipients');
    const subject = document.querySelector('#compose-subject');
    const body = document.querySelector('#compose-body');

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
        console.log(email);

        // Pre-fill form fields
        recipients.value = `${email.sender}`;
        if (/^Re:/g.test(email.subject)) {
            subject.value = `${email.subject}`;
        }
        else {
            subject.value = `Re: ${email.subject}`;
        }
        body.value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}`;
    })

    // Submit reply
    document.querySelector('#compose-form').addEventListener('submit', event => {
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: recipients.value,
                subject: subject.value,
                body: body.value
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
        })
        event.preventDefault();
        setTimeout(() => load_mailbox('sent'), 500);
    })
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h2 class="w3-opacity">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h2>`;

  // Archiving
  function archive(email_id) {
      fetch(`/emails/${email_id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: true
          })
      })
      .then(response => response.json())
      .then(result => {
          console.log(result);
      })
      setTimeout(() => load_mailbox('inbox'), 200);
  }

  // Unarchiving
  function unarchive(email_id) {
      fetch(`/emails/${email_id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: false
          })
      })
      .then(response => response.json())
      .then(result => {
          console.log(result);
      })
      setTimeout(() => load_mailbox('inbox'), 200);
  }

  // Email page
  function email_view(email_id) {
      document.querySelector('#email-view').innerHTML = '';
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#email-view').style.display = 'block';

      fetch(`/emails/${email_id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
      })
      .then(response => response.json())
      .then(result => {
          console.log(result);
      })

      fetch(`/emails/${email_id}`)
      .then(response => response.json())
      .then(email => {
          console.log(email);

          const img = document.createElement('img');
          const p_sender = document.createElement('p');
          const p_recipients = document.createElement('p');
          const p_subject = document.createElement('h5');
          const p_timestamp = document.createElement('p');
          const p_body = document.createElement('p');
          const div_meta_data = document.createElement('div');
          const reply_button = document.createElement('button');
          const br = document.createElement('br');
          const hr = document.createElement('hr');
          const from_n_time = document.createElement('h4');

          p_sender.innerHTML = `<strong>From:</strong> ${email.sender}`;
          p_recipients.innerHTML = `<strong>To:</strong> ${email.recipients}`;
          p_subject.innerHTML = `Subject: ${email.subject}`;
          p_timestamp.innerHTML = `<strong>Timestamp:</strong> ${email.timestamp}`;
          p_body.innerHTML = `<pre>${email.body}</pre>`;
          from_n_time.innerHTML = `<i class="fa fa-clock-o"></i> From ${email.sender}, ${email.timestamp}`;
          reply_button.innerHTML = `Reply<i class="w3-margin-left fa fa-mail-reply"></i>`;
          reply_button.className = 'w3-button w3-light-grey';
          img.src = 'https://www.w3schools.com/w3images/avatar2.png';
          img.style.width = '20%';
          img.className = 'w3-round';
          p_subject.className = 'w3-opacity';

          div_meta_data.appendChild(br);
          div_meta_data.appendChild(img);
          div_meta_data.appendChild(p_subject);
          div_meta_data.appendChild(from_n_time);
          div_meta_data.appendChild(p_recipients);

          document.querySelector('#email-view').append(div_meta_data);
          document.querySelector('#email-view').append(reply_button);
          document.querySelector('#email-view').append(hr);
          document.querySelector('#email-view').append(p_body);

          reply_button.addEventListener('click', () => reply_email(email.id))
      })
  }

  // Mailbox view
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      console.log(emails);

      for (let i in emails) {
          const email_container = document.createElement('div');
          const email_brief = document.createElement('div');
          const email_meta_data = document.createElement('div');
          const span_sender = document.createElement('span');
          const p_subject = document.createElement('p');
          const p_timestamp = document.createElement('p');
          const archive_button = document.createElement('button');
          const unarchive_button = document.createElement('button');
          const view_button = document.createElement('button');
          const img = document.createElement('img');
          const email = emails[i];
          email_container.id = 'email-container';
          email_brief.id = 'email-brief';
          email_meta_data.id = 'email-meta-data';
          archive_button.id = 'archive-button';

          img.src = 'https://www.w3schools.com/w3images/avatar2.png';
          img.style.width = '4%';
          img.className = 'w3-round';
          span_sender.innerHTML = `${email.sender}`;
          p_subject.innerHTML = `Subject: ${email.subject}`;
          p_timestamp.innerHTML = `${email.timestamp}`;
          p_timestamp.id = 'timestamp';
          p_subject.id = 'subject';
          view_button.textContent = 'View';
          span_sender.className = 'w3-opacity w3-medium w3-margin-left';
          archive_button.innerHTML = `<i class="fa fa-archive"></i> Archive`;
          archive_button.className = 'archiving w3-button w3-white w3-padding-small w3-border';
          unarchive_button.innerHTML = `<i class="fa fa-folder-open"></i> Unarchive`;
          unarchive_button.className = 'archiving w3-button w3-white w3-padding-small w3-border';

          email_brief.appendChild(img);
          email_brief.appendChild(span_sender);
          email_brief.appendChild(p_subject);
          email_meta_data.appendChild(p_timestamp);

          if (email.read) {
              email_container.style.backgroundColor = '#f2f2f2';
          }

          if (mailbox === 'inbox') {
              email_meta_data.appendChild(archive_button);
          }

          if (mailbox === 'archive') {
              email_meta_data.appendChild(unarchive_button);
          }

          email_container.addEventListener('mouseenter', () => {
              email_container.style.backgroundColor = '#d9d9d9';
          })

          email_container.addEventListener('mouseleave', () => {
              if (email.read) {
                  email_container.style.backgroundColor = '#f2f2f2';
              }
              else {
                  email_container.style.backgroundColor = 'white';
              }
          })

          document.querySelector('#emails-view').append(email_container);
          email_container.append(email_brief);
          email_container.append(email_meta_data);
          email_brief.addEventListener('click', () => email_view(email.id));
          archive_button.addEventListener('click', () => archive(email.id));
          unarchive_button.addEventListener('click', () => unarchive(email.id));
      }
  })
}

// To close sidebar
function nav_close() {
    document.getElementById("navSidebar").style.display = "none";
    document.getElementById("navOverlay").style.display = "none";
}

// To open sidebar
function nav_open() {
    document.getElementById("navSidebar").style.display = "block";
    document.getElementById("navOverlay").style.display = "block";
}