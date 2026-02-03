import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.*;
import org.testng.Assert;
import org.testng.annotations.*;
import java.time.Duration;

public class TC-Func-SP-1-3_Test {
    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeClass
    public void setUp() {
        System.setProperty("webdriver.chrome.driver", "/path/to/chromedriver");
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @Test
    public void test_TC-Func-SP-1-3() {
        // Preconditions: Application home page is loaded
        driver.get("http://example.com"); // TODO: replace with actual URL

        // Step 1: Navigate to signup page
        driver.findElement(By.cssSelector("[data-testid='TODO']")).click(); // TODO: replace with actual signup link selector

        // Enter invalid email
        WebElement emailField = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='TODO']"))
        ); // TODO: replace with actual email field selector
        emailField.clear();
        emailField.sendKeys("invalidemailformat");

        // Enter valid password
        WebElement passwordField = driver.findElement(By.cssSelector("[data-testid='TODO']")); // TODO: replace with actual password field selector
        passwordField.clear();
        passwordField.sendKeys("ValidPassword123");

        // Submit the signup form
        driver.findElement(By.cssSelector("[data-testid='TODO']")).click(); // TODO: replace with actual submit button selector

        // Expected: System shows validation error stating email format is invalid
        WebElement errorMsg = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='TODO']"))
        ); // TODO: replace with actual error message selector
        Assert.assertTrue(errorMsg.isDisplayed(), "Validation error message is not displayed");
        Assert.assertTrue(errorMsg.getText().toLowerCase().contains("email format is invalid"),
                "Error message does not indicate invalid email format");
    }

    @AfterClass
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}