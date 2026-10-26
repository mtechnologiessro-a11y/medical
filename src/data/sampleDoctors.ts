import { MockPage } from '../types';

export const MOCK_DIRECTORY_PAGES: MockPage[] = [
  {
    pageNumber: 1,
    doctors: [
      {
        id: 'doc-001',
        slug: 'jan-kovac-kardiologia',
        name: 'MUDr. Ján Kováč, PhD.',
        specialty: 'Kardiológia (Cardiology)',
        address: 'Poliklinika Mlynská Dolina, Staré Grunty 56, 841 04 Bratislava',
        phone: '+421 2 6823 4111',
        email: 'kovac.kardio@poliklinika-md.sk',
        htmlSnippet: `<article class="doctor-profile-card">
  <h1 class="doctor-name" itemprop="name">MUDr. Ján Kováč, PhD.</h1>
  <div class="doctor-specialty">Kardiológia</div>
  <div class="clinic-address-box">
    <span class="label">Adresa:</span>
    <span class="address" itemprop="streetAddress">Staré Grunty 56, 841 04 Bratislava</span>
  </div>
  <div class="contact-row">
    <span class="label">Telefón:</span>
    <a href="tel:+421268234111" class="doctor-phone">+421 2 6823 4111</a>
  </div>
  <div class="contact-row">
    <span class="label">E-mail:</span>
    <a href="mailto:kovac.kardio@poliklinika-md.sk" class="doctor-email">kovac.kardio@poliklinika-md.sk</a>
  </div>
</article>`
      },
      {
        id: 'doc-002',
        slug: 'elena-novakova-pediatria',
        name: 'MUDr. Elena Nováková',
        specialty: 'Všeobecná starostlivosť o deti a dorast (Pediatrics)',
        address: 'Zdravotné Stredisko Bezručova 5, 811 09 Bratislava - Staré Mesto',
        phone: '+421 905 442 819',
        email: 'dr.novakova@pediatriaba.sk',
        htmlSnippet: `<article class="doctor-profile-card">
  <h1 class="doctor-name" itemprop="name">MUDr. Elena Nováková</h1>
  <div class="doctor-specialty">Pediatria</div>
  <div class="clinic-address-box">
    <span class="label">Adresa:</span>
    <span class="address">Bezručova 5, 811 09 Bratislava - Staré Mesto</span>
  </div>
  <div class="contact-row">
    <span class="label">Telefón:</span>
    <a href="tel:+421905442819" class="doctor-phone">+421 905 442 819</a>
  </div>
  <div class="contact-row">
    <span class="label">E-mail:</span>
    <a href="mailto:dr.novakova@pediatriaba.sk" class="doctor-email">dr.novakova@pediatriaba.sk</a>
  </div>
</article>`
      },
      {
        id: 'doc-003',
        slug: 'peter-balog-stomatologia',
        name: 'MDDr. Peter Balog, MPH',
        specialty: 'Zubné lekárstvo (Dentistry)',
        address: 'DentalCare Clinic, Hlavná 42, 040 01 Košice',
        phone: '+421 55 622 1845',
        email: '', // Missing email edge case
        htmlSnippet: `<article class="doctor-profile-card">
  <h1 class="doctor-name" itemprop="name">MDDr. Peter Balog, MPH</h1>
  <div class="doctor-specialty">Zubné lekárstvo</div>
  <div class="clinic-address-box">
    <span class="label">Adresa:</span>
    <span class="address">Hlavná 42, 040 01 Košice</span>
  </div>
  <div class="contact-row">
    <span class="label">Telefón:</span>
    <a href="tel:+421556221845" class="doctor-phone">+421 55 622 1845</a>
  </div>
  <!-- Email is withheld by the doctor on this portal -->
  <div class="notice-muted">E-mail nebol poskytnutý</div>
</article>`
      },
      {
        id: 'doc-004',
        slug: 'zuzana-tothova-dermatologia',
        name: 'doc. MUDr. Zuzana Tóthová, CSc.',
        specialty: 'Dermatovenerológia (Dermatology)',
        address: 'Dermacenter, Námestie SNP 14, 974 01 Banská Bystrica',
        phone: '+421 48 414 7790',
        email: 'ambulancia@dermabb.sk',
        htmlSnippet: `<article class="doctor-profile-card">
  <h1 class="doctor-name" itemprop="name">doc. MUDr. Zuzana Tóthová, CSc.</h1>
  <div class="doctor-specialty">Dermatológia</div>
  <div class="clinic-address-box">
    <span class="label">Adresa:</span>
    <span class="address">Námestie SNP 14, 974 01 Banská Bystrica</span>
  </div>
  <div class="contact-row">
    <span class="label">Telefón:</span>
    <a href="tel:+421484147790" class="doctor-phone">+421 48 414 7790</a>
  </div>
  <div class="contact-row">
    <span class="label">E-mail:</span>
    <a href="mailto:ambulancia@dermabb.sk" class="doctor-email">ambulancia@dermabb.sk</a>
  </div>
</article>`
      }
    ]
  },
  {
    pageNumber: 2,
    doctors: [
      {
        id: 'doc-005',
        slug: 'martin-horvath-ortopedia',
        name: 'MUDr. Martin Horváth',
        specialty: 'Ortopédia (Orthopedics)',
        address: 'Fakultná nemocnica s poliklinikou, Spanyolova 43, 012 07 Žilina',
        phone: '+421 41 5110 320',
        email: 'horvath.ortopedia@fnspza.sk',
        htmlSnippet: `<article class="doctor-profile-card">
  <h1 class="doctor-name" itemprop="name">MUDr. Martin Horváth</h1>
  <div class="doctor-specialty">Ortopédia</div>
  <div class="clinic-address-box">
    <span class="label">Adresa:</span>
    <span class="address">Spanyolova 43, 012 07 Žilina</span>
  </div>
  <div class="contact-row">
    <span class="label">Telefón:</span>
    <a href="tel:+421415110320" class="doctor-phone">+421 41 5110 320</a>
  </div>
  <div class="contact-row">
    <span class="label">E-mail:</span>
    <a href="mailto:horvath.ortopedia@fnspza.sk" class="doctor-email">horvath.ortopedia@fnspza.sk</a>
  </div>
</article>`
      },
      {
        id: 'doc-006',
        slug: 'martina-krajcirova-neurologia',
        name: 'MUDr. Martina Krajčírová',
        specialty: 'Neurológia (Neurology)',
        address: 'Neurologické centrum, Tehelná 26, 831 03 Bratislava - Nové Mesto',
        phone: '', // Missing phone edge case
        email: 'recepcia@neurocentrum-tehelna.sk',
        htmlSnippet: `<article class="doctor-profile-card">
  <h1 class="doctor-name" itemprop="name">MUDr. Martina Krajčírová</h1>
  <div class="doctor-specialty">Neurológia</div>
  <div class="clinic-address-box">
    <span class="label">Adresa:</span>
    <span class="address">Tehelná 26, 831 03 Bratislava - Nové Mesto</span>
  </div>
  <div class="contact-row">
    <span class="label">Telefón:</span>
    <span class="text-muted">Objednávanie výlučne cez online formulár</span>
  </div>
  <div class="contact-row">
    <span class="label">E-mail:</span>
    <a href="mailto:recepcia@neurocentrum-tehelna.sk" class="doctor-email">recepcia@neurocentrum-tehelna.sk</a>
  </div>
</article>`
      },
      {
        id: 'doc-007',
        slug: 'richard-molnar-oftalmologia',
        name: 'MUDr. Richard Molnár',
        specialty: 'Oftalmológia (Ophthalmology)',
        address: 'Očná klinika VESELY, Trnavská cesta 82, 821 02 Bratislava',
        phone: '+421 2 3211 4455',
        email: 'bratislava@veselyok.sk',
        htmlSnippet: `<article class="doctor-profile-card">
  <h1 class="doctor-name" itemprop="name">MUDr. Richard Molnár</h1>
  <div class="doctor-specialty">Oftalmológia</div>
  <div class="clinic-address-box">
    <span class="label">Adresa:</span>
    <span class="address">Trnavská cesta 82, 821 02 Bratislava</span>
  </div>
  <div class="contact-row">
    <span class="label">Telefón:</span>
    <a href="tel:+421232114455" class="doctor-phone">+421 2 3211 4455</a>
  </div>
  <div class="contact-row">
    <span class="label">E-mail:</span>
    <a href="mailto:bratislava@veselyok.sk" class="doctor-email">bratislava@veselyok.sk</a>
  </div>
</article>`
      },
      {
        id: 'doc-008',
        slug: 'lubica-vargova-gynekologia',
        name: 'MUDr. Ľubica Vargová',
        specialty: 'Gynekológia a pôrodníctvo (Gynecology)',
        address: 'GynMed ambulancia, Štefánikova 12, 917 01 Trnava',
        phone: '+421 33 551 2980',
        email: 'vargova.gyn@gynmed-trnava.sk',
        htmlSnippet: `<article class="doctor-profile-card">
  <h1 class="doctor-name" itemprop="name">MUDr. Ľubica Vargová</h1>
  <div class="doctor-specialty">Gynekológia</div>
  <div class="clinic-address-box">
    <span class="label">Adresa:</span>
    <span class="address">Štefánikova 12, 917 01 Trnava</span>
  </div>
  <div class="contact-row">
    <span class="label">Telefón:</span>
    <a href="tel:+421335512980" class="doctor-phone">+421 33 551 2980</a>
  </div>
  <div class="contact-row">
    <span class="label">E-mail:</span>
    <a href="mailto:vargova.gyn@gynmed-trnava.sk" class="doctor-email">vargova.gyn@gynmed-trnava.sk</a>
  </div>
</article>`
      }
    ]
  },
  {
    pageNumber: 3,
    doctors: [
      {
        id: 'doc-009',
        slug: 'igor-urban-urologia',
        name: 'MUDr. Igor Urban',
        specialty: 'Urológia (Urology)',
        address: 'Poliklinika Sever, Komenského 37, 040 01 Košice',
        phone: '+421 55 633 4912',
        email: 'urban.urologia@poliklinikasever.sk',
        htmlSnippet: `<article class="doctor-profile-card">
  <h1 class="doctor-name" itemprop="name">MUDr. Igor Urban</h1>
  <div class="doctor-specialty">Urológia</div>
  <div class="clinic-address-box">
    <span class="label">Adresa:</span>
    <span class="address">Komenského 37, 040 01 Košice</span>
  </div>
  <div class="contact-row">
    <span class="label">Telefón:</span>
    <a href="tel:+421556334912" class="doctor-phone">+421 55 633 4912</a>
  </div>
  <div class="contact-row">
    <span class="label">E-mail:</span>
    <a href="mailto:urban.urologia@poliklinikasever.sk" class="doctor-email">urban.urologia@poliklinikasever.sk</a>
  </div>
</article>`
      },
      {
        id: 'doc-010',
        slug: 'katarina-simkova-psychiatria',
        name: 'MUDr. Katarína Šimková',
        specialty: 'Psychiatria a psychoterapia (Psychiatry)',
        address: 'Kollárova 20, 949 01 Nitra',
        phone: '+421 37 652 1100',
        email: '', // Missing email edge case
        htmlSnippet: `<article class="doctor-profile-card">
  <h1 class="doctor-name" itemprop="name">MUDr. Katarína Šimková</h1>
  <div class="doctor-specialty">Psychiatria</div>
  <div class="clinic-address-box">
    <span class="label">Adresa:</span>
    <span class="address">Kollárova 20, 949 01 Nitra</span>
  </div>
  <div class="contact-row">
    <span class="label">Telefón:</span>
    <a href="tel:+421376521100" class="doctor-phone">+421 37 652 1100</a>
  </div>
  <div class="contact-row">
    <span class="label">E-mail:</span>
    <span class="text-muted">Lekár neuviedol e-mailovú adresu</span>
  </div>
</article>`
      }
    ]
  }
];
